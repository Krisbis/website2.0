---
title: XZ Utils Backdoor
category: Security
environment: Supply Chain
excerpt: Thoughts & Notes
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

One of my favourite quotes from Darknet Diaries is *"..when truth is stranger than fiction"*. That encapsulates many of the incidents and stories we hear and see when dealing with cyber. It's both exhilarating and scary.

Advanced attacks where social engineering acts as a central aspect of the attack path are captivating to me. It taps into the human psyche and emphasizes what I consider to be a fact: every single one of us is inherently "vulnerable". Given the right conditions at the right time, I believe all of us can be "exploited".

The XZ Utils backdoor incident of 2024 brought all of this together. Technical prowess and creativity of a nation-state actor, an exceptionally deterministic social engineering operation that played out over *years*, and a happy ending handed to us by a German developer who was annoyed that SSH took 500ms longer to authenticate. Thank you, Germany, and your engineering precision.

## Supply Chain Attack via Dependencies

Most people don't think about `xz` or `liblzma`. It's a compression library, one of many quiet utilities that lives deep in the dependency tree of virtually every Linux distribution. But here's the thing: `liblzma` is linked by `libsystemd`, and `libsystemd` is linked by OpenSSH's `sshd` on many distros (particularly those that ship patched versions of OpenSSH integrating with systemd for notifications and socket activation).

That's the attack surface. Not SSH itself, but a compression library *two layers down* the dependency chain that SSH never explicitly asked for.

This is the fundamental challenge of supply chain security. Modern software doesn't just depend on what you think it depends on. It depends on what *those* things depend on, and what *those* depend on, recursively down the stack. Keeping an accurate, real-time mental model of every transitive dependency, its maintainers, its release process, and its integrity — that's not a task any single human or team can realistically do at scale. Yet that is exactly what would be needed to catch something like this before it ships.

## Phase 1: The Long Con — Social Engineering Operation

This is what makes this incident extraordinary. It wasn't a zero-day exploit or a stolen credential. It was patience.

A persona going by **Jia Tan** (GitHub handle `JiaT75`) began contributing to the XZ Utils project around **2021**. Early contributions were harmless and helpful — fixing bugs, cleaning code, genuinely useful work. The kind of contributions any maintainer would welcome.

Simultaneously, the original XZ maintainer, **Lasse Collin**, started receiving pressure from other accounts, complaining about slow patch reviews and suggesting the project needed another maintainer. Some of these accounts appeared to exist solely for this purpose — manufactured social pressure applied over months.

It worked. By **2023**, Jia Tan had earned enough trust to receive commit access. By early **2024**, they were effectively co-maintaining the project.

The entire social engineering operation was designed to exploit one of the most human dynamics in open source: a lone, overwhelmed maintainer who genuinely needed help, being offered it by someone who had put in the work. There was no reason to say no. That's what makes it so effective and so difficult to defend against.

## Phase 2: Laying the Groundwork

With maintainer access secured, the technical operation began. But it wasn't rushed. The changes came in incrementally, each one looking reasonable in isolation:

- **Test infrastructure manipulation** — Jia Tan added binary test fixture files (`.xz` compressed blobs) to the repository. These looked like legitimate test cases for the compression library. In reality, they contained the obfuscated payload that would later be extracted and injected during the build process.

- **Build system modifications** — Subtle changes were made to the autotools build scripts (`configure`, `Makefile.in`, and related m4 macros). These modifications conditionally executed during `make` only under specific circumstances — specifically when building on x86-64 Linux with GCC and when the build environment looked like a Debian or RPM package build (not a developer build).

- **Gradual normalization** — Each change individually passed review. The test files were "just test data". The build changes were "just cleanup". The layering was so gradual that no single commit raised alarm bells.

## Phase 3: The Backdoor

The actual backdoor was elegant in a deeply uncomfortable way.

During the build process of the tainted release (versions **5.6.0** and **5.6.1**), the malicious build scripts would:

1. **Extract a hidden payload** from the binary test files using a chain of shell commands that unpacked, decoded, and decrypted the obfuscated data.
2. **Inject a compiled object file** into `liblzma` during linking — this object hooked into the library's symbol resolution.
3. **Hijack the authentication path** — the injected code patched `RSA_public_decrypt()` in the running `sshd` process through indirect function resolution (`IFUNC`). This allowed the attacker to intercept authentication and execute arbitrary commands before the real authentication check ran.

The result: **a pre-auth remote code execution backdoor in SSH**, triggered by a specially crafted public key sent during connection. Anyone with the right key could authenticate to any affected `sshd` without credentials.

At a very high level, the payload logic looked something like this:

```text
Client connects to sshd
  |
  v
  sshd reaches RSA verification
  |
  v
backdoored liblzma hook runs first
  |
  v
Checks for attacker-controlled auth pattern
  |
   +----+----+
   |         |
  Yes        No
   |         |
   v         v
Bypass /     Continue normal
redirect     SSH auth flow
auth path
```

That is simplified, but the core idea is the same: the malicious code gets a chance to inspect the authentication path first. If the incoming material matches what the attacker expects, it diverts execution. If not, `sshd` continues as normal, which is part of what made the backdoor so hard to spot in ordinary use.

And it only activated on x86-64 Debian/Ubuntu-style systems building packages. Developer machines running `./configure && make` from source wouldn't trigger it. CI running tests wouldn't trigger it. Only the package build pipeline would produce the backdoored binary. That's targeting with surgical precision.

## Phase 4: Discovery — 500ms That Saved the Internet

In **March 2024**, **Andres Freund**, a PostgreSQL developer at Microsoft, noticed something that would've gone past most people: his SSH logins were taking about **500ms longer** than expected. That's it — half a second.

Instead of shrugging it off, he dug in. He profiled `sshd`, traced the latency to `liblzma`, and eventually uncovered the full backdoor chain. He disclosed it to the `oss-security` mailing list on **March 29, 2024**, and the security world collectively lost its mind.

One detail I really like from Andres' write-up is that the strange over-obfuscation was part of what made the whole thing stand out. If the payload had been cleaner and less bizarre, it may well have blended into the noise for longer. Sometimes attackers get caught not because they are unsophisticated, but because they become *too* weird.

The vulnerability was assigned **CVE-2024-3094** with a CVSS score of **10.0** — the maximum.

The timing was extraordinary. The backdoored versions had just started to land in unstable/testing branches of major distros. Debian Sid, Fedora Rawhide and 40 beta, openSUSE Tumbleweed, and Arch had pulled the tainted versions. If the discovery had been even a few weeks later, these versions would have migrated to stable releases, potentially affecting millions of systems.

One developer's instinct to investigate a half-second delay quite literally prevented what could have been one of the most devastating supply chain compromises in history.

## Summary

This incident reveals uncomfortable truths at every layer:

**The malicious maintainer problem is nearly unsolvable.** Jia Tan did everything right by open-source community standards — they contributed consistently, earned trust organically, and were *invited* to maintain. Every code review process, every contributor vetting heuristic, every web of trust model struggles against someone willing to invest years of patient, legitimate work. The trust model of open source depends on maintainers being trustworthy, and when that assumption fails, the blast radius is enormous.

**Dependencies are deeply, recursively dangerous.** SSH didn't depend on `xz`. SSH depended on `systemd` notifications, which depended on `libsystemd`, which depended on `liblzma`, which is part of `xz`. Nobody installing OpenSSH was thinking about their compression library dependency chain. And yet that chain is what carried the backdoor into the most security-critical daemon on most Linux systems. You could audit SSH and systemd to death and still not catch a threat living two links down. Oh, and speaking of systemd — this whole attack vector only existed because systemd being systemd had to pull in yet another dependency it arguably didn't need. Some things never change.

**The discovery was pure luck and individual brilliance.** We were saved not by any automated tool, security audit, package signing check, or reproducible build verification. We were saved by one person noticing a half-second delay and being stubborn enough to trace it. That's not a security model — that's a lottery.

And here's the thing that sits with me the most: **our public digital infrastructure fundamentally relies on the backs of highly skilled volunteers**. People who create and maintain passion projects, giving all of us the tools we build on, at no cost. Lasse Collin maintained XZ Utils essentially alone for years. That isolation is exactly what made the social engineering possible.

Companies that build billion-dollar products on open-source foundations have a responsibility to support the maintainers behind them. We need to make open-source contribution more sustainable and more rewarding for those who've poured significant hours, years even, into solving problems that all of us benefit from. Because right now, the security of critical infrastructure often depends on whether one overworked volunteer happens to have a good week.
