/* ══════════════════════════════════════════════════════════
   Acronym Quiz — "Welcome To The Grill"
   Quiz data + logic (extracted from inline script)
   ══════════════════════════════════════════════════════════ */

const CATEGORIES = [
  {
    id:'cybersecurity', name:'Cybersecurity', color:'#ff2d4a', tag:'CYBER', desc:'Threats, attacks & defenses',
    questions:{
      easy:[
        {q:'SQL',a:'Structured Query Language',w:['Secure Query Language','System Query Logic','Sequential Queue List']},
        {q:'VPN',a:'Virtual Private Network',w:['Verified Public Node','Virtual Proxy Network','Validated Protocol Network']},
        {q:'DDoS',a:'Distributed Denial of Service',w:['Direct Denial of System','Dynamic Data over Service','Distributed Data Object Security']},
        {q:'2FA',a:'Two-Factor Authentication',w:['Two-Firewall Authorization','Twice-Fail Authentication','Two-Form Access']},
        {q:'MFA',a:'Multi-Factor Authentication',w:['Multiple Firewall Access','Managed File Authorization','Multi-Form Authentication']},
        {q:'XSS',a:'Cross-Site Scripting',w:['Extended Security System','Cross-Server Scan','Extra Scripting Service']},
        {q:'CSRF',a:'Cross-Site Request Forgery',w:['Central Security Response Framework','Cross-Service Request Failure','Client-Side Request Filtering']},
        {q:'CVE',a:'Common Vulnerabilities and Exposures',w:['Critical Vulnerability Exploit','Central Vulnerability Engine','Common Virus Enumeration']},
        {q:'IOC',a:'Indicator of Compromise',w:['Index of Controls','Instance of Compliance','Intrusion Operation Check']},
        {q:'APT',a:'Advanced Persistent Threat',w:['Automated Penetration Tool','Advanced Protocol Testing','Application Permission Token']},
        {q:'IDS',a:'Intrusion Detection System',w:['Internal Defense System','Internet Discovery Service','Integrated Data Scanner']},
        {q:'IPS',a:'Intrusion Prevention System',w:['Internet Protection Service','Internal Proxy Server','Integrated Policy System']},
        {q:'WAP',a:'Wireless Access Point',w:['Web Application Protocol','Wide Area Proxy','Wireless Authentication Portal']},
        {q:'DoS',a:'Denial of Service',w:['Domain of Security','Data over Stream','Distributed Operating Service']},
        {q:'SOC',a:'Security Operations Center',w:['System Operations Command','Secure Online Channel','Standard Operating Control']},
      ],
      medium:[
        {q:'SIEM',a:'Security Information and Event Management',w:['System Incident Event Monitor','Secure Infrastructure Event Model','Security Intrusion Evaluation Module']},
        {q:'SOAR',a:'Security Orchestration Automation and Response',w:['Security Operations Analysis Reporting','Secure Online Access Router','System Operations Automated Remediation']},
        {q:'EDR',a:'Endpoint Detection and Response',w:['Enterprise Data Replication','Extended Detection Registry','Event-Driven Response']},
        {q:'OSINT',a:'Open Source Intelligence',w:['Operational Security Intelligence','Online Security Intrusion Toolkit','Open System Information Network Technology']},
        {q:'TTPs',a:'Tactics Techniques and Procedures',w:['Threat Tracking Protocols','Target Targeting Process','Technical Testing Procedures']},
        {q:'OPSEC',a:'Operations Security',w:['Open Protocol Security','Operational System Encryption','Online Platform Security']},
        {q:'CVSS',a:'Common Vulnerability Scoring System',w:['Centralized Vulnerability Security System','Critical Vulnerability Scan Score','Common Virus Severity Score']},
        {q:'SSRF',a:'Server-Side Request Forgery',w:['Secure Session Request Framework','System-Side Resource Fetching','Shared Server Request Filtering']},
        {q:'C2',a:'Command and Control',w:['Client to Cloud','Core Credential','Code to Console']},
        {q:'XDR',a:'Extended Detection and Response',w:['External Data Recovery','Extended Data Relay','eXtended Deployment Runtime']},
        {q:'NDR',a:'Network Detection and Response',w:['Node Data Recovery','Network Data Relay','Network Defense Router']},
        {q:'MDR',a:'Managed Detection and Response',w:['Managed Data Recovery','Multi-Domain Response','Monitored Defense Response']},
        {q:'NGFW',a:'Next-Generation Firewall',w:['Network Gateway Filter Wall','New Global Firewall','Node-Generated Firewall']},
        {q:'NAC',a:'Network Access Control',w:['Node Authentication Certificate','Network Admission Connector','Network Automated Configuration']},
        {q:'DPI',a:'Deep Packet Inspection',w:['Data Privacy Interface','Dynamic Packet Interception','Direct Protocol Injection']},
      ],
      hard:[
        {q:'STIX',a:'Structured Threat Information eXpression',w:['Standard Threat Intelligence eXchange','Security Threat Identification eXtension','Structured Threat Indicator eXamination']},
        {q:'BYOVD',a:'Bring Your Own Vulnerable Driver',w:['Bring Your Own Verified Data','Build Your Own Vulnerability Database','Bypass Your Own Verification Daemon']},
        {q:'UEBA',a:'User and Entity Behavior Analytics',w:['Unified Endpoint Behavior Analysis','User Endpoint Baseline Assessment','Universal Entity Behavior Audit']},
        {q:'ZTNA',a:'Zero Trust Network Access',w:['Zone Transfer Network Architecture','Zero Threat Node Authentication','Zone-Tested Network Access']},
        {q:'DMARC',a:'Domain-based Message Authentication Reporting and Conformance',w:['Dynamic Mail Abuse Reporting Check','Domain Mail Access Routing Control','Dedicated Mail Authentication and Relay Control']},
        {q:'CASB',a:'Cloud Access Security Broker',w:['Centralized Access Security Baseline','Cloud Authentication Session Broker','Content Access Security Bridge']},
        {q:'TAXII',a:'Trusted Automated eXchange of Intelligence Information',w:['Threat Analysis eXchange and Intelligence Integration','Trusted Authentication eXchange Intelligence Interface','Tactical Automated eXchange of Incident Information']},
        {q:'TOCTOU',a:'Time-of-Check to Time-of-Use',w:['Type of Compromise to Type of Update','Token Credential Token Operation Unit','Threat Ops Capability Threat Ops Update']},
        {q:'DKIM',a:'DomainKeys Identified Mail',w:['Domain Key Integration Mechanism','Dynamic Key Infrastructure Management','Data Key Integrity Marker']},
        {q:'SPF',a:'Sender Policy Framework',w:['Security Protocol Filter','Spam Prevention Framework','Sender Permission File']},
        {q:'HIDS',a:'Host-based Intrusion Detection System',w:['Hybrid Intrusion Defense System','Hardware Intrusion Detection Service','Hosted Integrity Detection System']},
        {q:'NIDS',a:'Network-based Intrusion Detection System',w:['Node Intrusion Defense Service','Network Identity Detection System','Networked Integrity Defense Service']},
        {q:'YARA',a:'Yet Another Ridiculous Acronym',w:['Your Automated Response Agent','Yielded Attack Recognition Algorithm','Your Analytical Rule Application']},
        {q:'HIPS',a:'Host-based Intrusion Prevention System',w:['Hybrid Intrusion Protection Service','Hardware Intrusion Prevention Scanner','High-Integrity Protection System']},
        {q:'EPP',a:'Endpoint Protection Platform',w:['Enterprise Privacy Protocol','Extended Protection Process','Endpoint Permission Policy']},
      ]
    }
  },
  {
    id:'infosec', name:'Information Security', color:'#7c4dff', tag:'INFOSEC', desc:'Standards, frameworks & policies',
    questions:{
      easy:[
        {q:'CIA',a:'Confidentiality Integrity and Availability',w:['Central Intelligence Agency','Core Information Architecture','Controlled Information Access']},
        {q:'AAA',a:'Authentication Authorization and Accounting',w:['Access Audit and Analysis','Automated Authentication Architecture','Application Authorization Agent']},
        {q:'ACL',a:'Access Control List',w:['Application Control Layer','Access Configuration Lookup','Automated Control Limit']},
        {q:'DAC',a:'Discretionary Access Control',w:['Dynamic Access Control','Data Access Certificate','Delegated Authority Control']},
        {q:'MAC',a:'Mandatory Access Control',w:['Media Access Control','Multi-Agent Control','Managed Access Certificate']},
        {q:'RBAC',a:'Role-Based Access Control',w:['Resource-Based Access Control','Rule-Based Authentication Check','Restricted Browser Access Control']},
        {q:'PKI',a:'Public Key Infrastructure',w:['Private Key Integration','Protocol Key Interface','Public Knowledge Index']},
        {q:'DLP',a:'Data Loss Prevention',w:['Data Link Protocol','Dynamic Log Processing','Distributed Learning Platform']},
        {q:'GRC',a:'Governance Risk and Compliance',w:['General Risk Control','Global Reporting Center','Guided Risk Compliance']},
        {q:'CA',a:'Certificate Authority',w:['Cyber Assessment','Central Authentication','Control Architecture']},
        {q:'CIS',a:'Center for Internet Security',w:['Core Information Standard','Central Infrastructure Security','Compliance Information System']},
        {q:'BIA',a:'Business Impact Analysis',w:['Basic Information Assessment','Business Integration Audit','Baseline Integrity Analysis']},
        {q:'NDA',a:'Non-Disclosure Agreement',w:['Network Data Access','National Defense Authorization','Node Distribution Agreement']},
        {q:'AUP',a:'Acceptable Use Policy',w:['Automated Update Protocol','Access User Privilege','Authentication Use Procedure']},
        {q:'SSO',a:'Single Sign-On',w:['Secure Server Operation','Standard Sign-On','System Security Operation']},
      ],
      medium:[
        {q:'NIST',a:'National Institute of Standards and Technology',w:['Network Infrastructure Security Testing','National Information Security Technology','Networked Intrusion System Toolkit']},
        {q:'ISO',a:'International Organization for Standardization',w:['Integrated Security Operations','Information Systems Office','Internal Security Operations']},
        {q:'PCI-DSS',a:'Payment Card Industry Data Security Standard',w:['Personal Credit Information Data Security Standard','Payment Control Interface Data Security System','Protocol Credit Information Digital Security Standard']},
        {q:'HIPAA',a:'Health Insurance Portability and Accountability Act',w:['Health Information Protection and Access Act','Healthcare Industry Privacy and Access Act','Health Integrity Protection Audit Act']},
        {q:'GDPR',a:'General Data Protection Regulation',w:['Global Data Privacy Rights','Generalized Data Processing Rules','Governed Data Protection Requirements']},
        {q:'ABAC',a:'Attribute-Based Access Control',w:['Advanced Behavior Access Control','Application-Based Authentication Control','Agent-Based Authorization Check']},
        {q:'FIPS',a:'Federal Information Processing Standards',w:['Federal Infrastructure Protection System','Financial Information Protection Standards','Federated Identity Processing Standards']},
        {q:'SOX',a:'Sarbanes-Oxley Act',w:['Security Operations Exchange','System Operations eXecution','Standardized Operations eXchange']},
        {q:'MOU',a:'Memorandum of Understanding',w:['Management of Uncertainty','Method of Usage','Minimum Operational Unit']},
        {q:'SLA',a:'Service Level Agreement',w:['Security Logging Architecture','System License Agreement','Service Layer Authorization']},
        {q:'FERPA',a:'Family Educational Rights and Privacy Act',w:['Federal Enterprise Resource Protection Act','Family Electronic Records Privacy Act','Federal Education Reporting and Privacy Act']},
        {q:'CCPA',a:'California Consumer Privacy Act',w:['Central Consumer Protection Agency','Cloud Consumer Privacy Agreement','Corporate Consumer Privacy Act']},
        {q:'SOC2',a:'Service Organization Control 2',w:['Security Operations Certification 2','System Operations Compliance 2','Standard Operations Control 2']},
        {q:'BCP',a:'Business Continuity Plan',w:['Backup Control Protocol','Base Configuration Plan','Business Compliance Protocol']},
        {q:'DRP',a:'Disaster Recovery Plan',w:['Data Replication Protocol','Dynamic Recovery Process','Distributed Redundancy Plan']},
      ],
      hard:[
        {q:'SABSA',a:'Sherwood Applied Business Security Architecture',w:['Security Architecture Baseline Standards Assessment','Structured Application Business Security Analysis','Standard Assurance Business Security Architecture']},
        {q:'TOGAF',a:'The Open Group Architecture Framework',w:['Technical Operations Governance and Framework','Total Organization Governance Architecture Framework','Technical Open Group Authorization Framework']},
        {q:'COBIT',a:'Control Objectives for Information Technologies',w:['Core Object-Based IT','Central Operations Business Integration Toolkit','Compliance Objectives for IT']},
        {q:'ITIL',a:'Information Technology Infrastructure Library',w:['Integrated Testing and IT Logging','IT Infrastructure Integrity Layer','Information Technology Incident Lifecycle']},
        {q:'FedRAMP',a:'Federal Risk and Authorization Management Program',w:['Federal Resource Access Management Protocol','Federal Regulatory Access Management Program','Federated Risk Assurance Management Protocol']},
        {q:'FISMA',a:'Federal Information Security Management Act',w:['Federal Infrastructure Security Management Architecture','Federal IT System Monitoring Act','Federal Integrated Security Management Act']},
        {q:'CMMC',a:'Cybersecurity Maturity Model Certification',w:['Centralized Malware Management Control','Compliance Maturity Model Check','Cyber Management and Monitoring Certification']},
        {q:'DIACAP',a:'DoD Information Assurance Certification and Accreditation Process',w:['Defense Intrusion and Compliance Analysis Program','Digital Infrastructure Access Certification and Protocol','DoD Integrated Access Control and Authorization Process']},
        {q:'COSO',a:'Committee of Sponsoring Organizations',w:['Centralized Operations Security Office','Common Object Security Operations','Controlled Organization Security Operations']},
        {q:'CIPA',a:"Children's Internet Protection Act",w:['Critical Infrastructure Protection Act','Cyber Intrusion Prevention Act','Common Internet Privacy Agreement']},
        {q:'ITAR',a:'International Traffic in Arms Regulations',w:['Information Technology Access Requirements','International Technology Audit Regulations','Internet Traffic Analysis Regulations']},
        {q:'NERC',a:'North American Electric Reliability Corporation',w:['National Enterprise Resilience Council','Network Emergency Response Center','National Electrical Regulatory Commission']},
        {q:'HITRUST',a:'Health Information Trust Alliance',w:['Health IT Reliability and Unified Standard','High Integrity Trust Alliance','Health Information Technology Resilience Unit']},
        {q:'RACI',a:'Responsible Accountable Consulted Informed',w:['Risk Assessment Compliance Index','Requirements Analysis Control Integration','Resource Allocation and Compliance Integration']},
        {q:'GLBA',a:'Gramm-Leach-Bliley Act',w:['Government Licensing and Business Act','Global Liability and Business Agreement','General Ledger and Banking Act']},
      ]
    }
  },
  {
    id:'networking', name:'Networking', color:'#00d4ff', tag:'NET', desc:'Protocols, routing & infrastructure',
    questions:{
      easy:[
        {q:'TCP',a:'Transmission Control Protocol',w:['Transfer Control Protocol','Transport Capability Protocol','Terminal Communication Protocol']},
        {q:'UDP',a:'User Datagram Protocol',w:['Unified Data Protocol','Universal Delivery Protocol','User Data Pipeline']},
        {q:'DNS',a:'Domain Name System',w:['Dynamic Network Service','Digital Name Server','Distributed Node Service']},
        {q:'DHCP',a:'Dynamic Host Configuration Protocol',w:['Dynamic Host Control Protocol','Distributed Hardware Configuration Protocol','Direct Host Channel Protocol']},
        {q:'NAT',a:'Network Address Translation',w:['Node Authentication Token','Network Access Tunnel','Network Allocation Table']},
        {q:'VLAN',a:'Virtual Local Area Network',w:['Virtual Link Access Node','Vendor LAN','Verified LAN']},
        {q:'BGP',a:'Border Gateway Protocol',w:['Bridged Gateway Protocol','Backbone Gateway Process','Binary Gateway Protocol']},
        {q:'OSPF',a:'Open Shortest Path First',w:['Optimized Shortest Path Forwarding','Open Socket Protocol Framework','Operating System Protocol Flow']},
        {q:'ARP',a:'Address Resolution Protocol',w:['Advanced Routing Protocol','Access Resolution Process','Adaptive Relay Protocol']},
        {q:'ICMP',a:'Internet Control Message Protocol',w:['Internal Control Message Protocol','Internet Connection Management Protocol','Integrated Control Message Protocol']},
        {q:'HTTP',a:'Hypertext Transfer Protocol',w:['High Throughput Transfer Protocol','Hosted Transfer Protocol','Hybrid Text Transfer Protocol']},
        {q:'HTTPS',a:'Hypertext Transfer Protocol Secure',w:['High Throughput Transfer Protocol Secure','Hosted Transfer Protocol Security','Hypertext Transaction Protocol Secure']},
        {q:'MAC',a:'Media Access Control',w:['Managed Access Certificate','Multi-Agent Control','Mandatory Access Control']},
        {q:'WAN',a:'Wide Area Network',w:['Wireless Access Node','Web Application Network','Wired Area Network']},
        {q:'LAN',a:'Local Area Network',w:['Logical Access Node','Linked Access Network','Large Area Network']},
      ],
      medium:[
        {q:'MPLS',a:'Multiprotocol Label Switching',w:['Managed Protocol Link Switching','Multiple Path Load Sharing','Multi-Path Logical Segmentation']},
        {q:'QoS',a:'Quality of Service',w:['Queuing of Sessions','Quantification of Systems','Query on Services']},
        {q:'HSRP',a:'Hot Standby Router Protocol',w:['High Speed Routing Protocol','Highly Secure Relay Protocol','Host Standby Redundancy Protocol']},
        {q:'VXLAN',a:'Virtual Extensible LAN',w:['Verified eXtended Local Area Network','Virtual eXchange LAN','VLAN eXtension Architecture Network']},
        {q:'SDN',a:'Software Defined Networking',w:['Secure Data Network','Static Data Networking','Standard Dynamic Networking']},
        {q:'EIGRP',a:'Enhanced Interior Gateway Routing Protocol',w:['Extended Interior Gateway Routing Protocol','Enterprise Interior Gateway Routing Protocol','Enhanced Internal Gateway Routing Process']},
        {q:'NTP',a:'Network Time Protocol',w:['Network Transfer Protocol','Node Timing Process','Network Token Protocol']},
        {q:'SNMP',a:'Simple Network Management Protocol',w:['Secure Network Monitoring Protocol','Standard Network Management Process','Simple Node Management Protocol']},
        {q:'LACP',a:'Link Aggregation Control Protocol',w:['Local Access Control Protocol','LAN Aggregation Channel Protocol','Layer Access Control Protocol']},
        {q:'GRE',a:'Generic Routing Encapsulation',w:['Gateway Routing Engine','Global Routing Exchange','General Routing Encapsulation']},
        {q:'RADIUS',a:'Remote Authentication Dial-In User Service',w:['Remote Access Direct Integrated User System','Rapid Authentication Directory User Service','Remote Authorization Directory Identification Utility Service']},
        {q:'RIP',a:'Routing Information Protocol',w:['Remote Internet Protocol','Recursive Information Path','Route Integration Protocol']},
        {q:'STP',a:'Spanning Tree Protocol',w:['Standard Topology Protocol','Static Transfer Protocol','Synchronized Tree Protocol']},
        {q:'CIDR',a:'Classless Inter-Domain Routing',w:['Centralized Internet Domain Registry','Core Internet Data Routing','Classless Internet Delivery Routing']},
        {q:'TACACS',a:'Terminal Access Controller Access-Control System',w:['Terminal Authentication and Control Access System','Technical Access Control and Authorization System','Terminal Access Certificate Authority Control System']},
      ],
      hard:[
        {q:'ECMP',a:'Equal-Cost Multi-Path routing',w:['Enhanced Core Multi-Protocol','Enterprise Centralized Multi-Path','Extended Core Multicast Protocol']},
        {q:'BFD',a:'Bidirectional Forwarding Detection',w:['Border Firewall Detection','Balanced Forwarding Distribution','Basic Fault Detection']},
        {q:'EVPN',a:'Ethernet VPN',w:['Extended VLAN Protocol Network','Encapsulated Virtual Private Node','Enhanced VPN Protocol']},
        {q:'VTEP',a:'VXLAN Tunnel Endpoint',w:['Virtual Tunnel Encapsulation Protocol','VLAN Transfer Endpoint','Virtual Terminal Entry Point']},
        {q:'RSTP',a:'Rapid Spanning Tree Protocol',w:['Redundant Spanning Tree Process','Remote Spanning Topology Protocol','Routed Spanning Tree Protocol']},
        {q:'PBR',a:'Policy-Based Routing',w:['Protocol-Based Relay','Path-Based Routing','Prefix-Based Routing']},
        {q:'IPFIX',a:'IP Flow Information Export',w:['IP File Index eXchange','Internal Protocol Flow Integration eXport','IP Fixed Flow Exchange']},
        {q:'SR-IOV',a:'Single Root I/O Virtualization',w:['Shared Resource I/O Verification','Single Router I/O VLAN','Standard Root Infrastructure Overlay Virtualization']},
        {q:'LISP',a:'Locator/ID Separation Protocol',w:['Link Isolation Security Protocol','Location Identification Segmentation Protocol','Logical Infrastructure Separation Protocol']},
        {q:'PIM',a:'Protocol Independent Multicast',w:['Port Independent Management','Passive Interface Messaging','Protocol Integrated Multicasting']},
        {q:'IGMP',a:'Internet Group Management Protocol',w:['Integrated Gateway Management Protocol','Internal Group Messaging Protocol','Internet Global Multicast Protocol']},
        {q:'VRF',a:'Virtual Routing and Forwarding',w:['Virtual Redundancy Framework','VLAN Routing Framework','Virtual Router Failover']},
        {q:'DWDM',a:'Dense Wavelength Division Multiplexing',w:['Dynamic Wide-band Data Multiplexing','Distributed Wavelength Division Module','Dense Wireless Data Multiplexing']},
        {q:'IS-IS',a:'Intermediate System to Intermediate System',w:['Integrated System Infrastructure Service','Internet Security Information System','Inter-Site Interconnection Service']},
        {q:'NETCONF',a:'Network Configuration Protocol',w:['Network Configuration Framework','Networked Control Function','Network Conference Protocol']},
      ]
    }
  },
  {
    id:'sysadmin', name:'Sysadmin', color:'#ffcc00', tag:'SYSADM', desc:'Systems, services & operations',
    questions:{
      easy:[
        {q:'OS',a:'Operating System',w:['Open Server','Object System','Operational Software']},
        {q:'VM',a:'Virtual Machine',w:['Virtual Memory','Volume Manager','Verified Module']},
        {q:'SSH',a:'Secure Shell',w:['System Security Host','Secure Session Handler','Standard Shell Host']},
        {q:'RAID',a:'Redundant Array of Independent Disks',w:['Rapid Access Integrated Drive','Remote Array of Independent Drives','Redundant Access Index Disk']},
        {q:'CLI',a:'Command Line Interface',w:['Client Login Interface','Configuration Layer Interface','Console Login Interface']},
        {q:'CPU',a:'Central Processing Unit',w:['Core Processing Utility','Central Protocol Unit','Centralized Processing Unit']},
        {q:'RAM',a:'Random Access Memory',w:['Read Access Module','Rapid Allocation Memory','Real-time Access Module']},
        {q:'NFS',a:'Network File System',w:['Network File Sharing','Node File Service','Networked File Store']},
        {q:'SMB',a:'Server Message Block',w:['Secure Message Broker','Service Message Base','Shared Module Block']},
        {q:'FTP',a:'File Transfer Protocol',w:['Fast Transfer Protocol','File Tracking Protocol','File Transport Process']},
        {q:'BIOS',a:'Basic Input Output System',w:['Built-In Operating System','Binary Input Output Standard','Base Integrated Operating System']},
        {q:'GPU',a:'Graphics Processing Unit',w:['General Processing Utility','Global Protocol Unit','Graphics Protocol Unit']},
        {q:'SSD',a:'Solid State Drive',w:['Standard Storage Device','System Storage Disk','Secure State Drive']},
        {q:'HDD',a:'Hard Disk Drive',w:['High-Density Drive','Hardware Data Device','Hosted Disk Drive']},
        {q:'SFTP',a:'SSH File Transfer Protocol',w:['Secure File Transfer Process','Standard File Transport Protocol','System File Transfer Protocol']},
      ],
      medium:[
        {q:'LDAP',a:'Lightweight Directory Access Protocol',w:['Local Directory Access Protocol','Linked Data Access Protocol','Legacy Directory Authentication Protocol']},
        {q:'AD',a:'Active Directory',w:['Authentication Daemon','Application Directory','Access Domain']},
        {q:'GPO',a:'Group Policy Object',w:['Global Policy Operator','Group Process Operation','General Provisioning Object']},
        {q:'WSUS',a:'Windows Server Update Services',w:['Windows Synchronized Update System','Windows Server Utility Suite','Windows Security Update System']},
        {q:'KVM',a:'Kernel-based Virtual Machine',w:['Key Value Management','Keyboard Video Mouse','Kernel Virtualization Module']},
        {q:'SAN',a:'Storage Area Network',w:['Server Access Node','Secure Area Network','Storage Allocation Node']},
        {q:'NAS',a:'Network Attached Storage',w:['Node Authentication Service','Network Access Server','Networked Archive System']},
        {q:'LVM',a:'Logical Volume Manager',w:['Linux Volume Module','Local Virtual Machine','Layer Volume Management']},
        {q:'PAM',a:'Privileged Access Management',w:['Password Authentication Module','Process Access Manager','Platform Access Management']},
        {q:'IPMI',a:'Intelligent Platform Management Interface',w:['IP Management Interface','Internal Platform Module Interface','Integrated Peripheral Management Integration']},
        {q:'SNTP',a:'Simple Network Time Protocol',w:['Secure Network Transfer Protocol','Standard Node Timing Protocol','Simple Node Transport Protocol']},
        {q:'WMI',a:'Windows Management Instrumentation',w:['Windows Monitoring Interface','Windows Module Integration','Wireless Management Interface']},
        {q:'SCCM',a:'System Center Configuration Manager',w:['System Control Configuration Module','Secure Configuration and Compliance Manager','Server Console Configuration Manager']},
        {q:'iLO',a:'Integrated Lights-Out',w:['Internal Logical Operations','Integrated Logical Output','Integrated Load Operations']},
        {q:'GRUB',a:'Grand Unified Bootloader',w:['General Runtime Unified Bootstrap','Generic Recovery Unified Base','GNU Recovery Utility Base']},
      ],
      hard:[
        {q:'iSCSI',a:'Internet Small Computer System Interface',w:['Integrated SCSI Interface','Internet Storage Control Interface','iSCSI Storage Channel Interface']},
        {q:'NUMA',a:'Non-Uniform Memory Access',w:['Network-Unified Memory Architecture','Non-Unified Memory Allocation','Node-Unified Memory Access']},
        {q:'UEFI',a:'Unified Extensible Firmware Interface',w:['Universal Embedded Firmware Interface','Unified Executable File Interface','Universal Extension Firmware Integration']},
        {q:'PXE',a:'Preboot eXecution Environment',w:['Parallel eXecution Engine','Protocol eXchange Extension','Preloaded eXtended Environment']},
        {q:'SAML',a:'Security Assertion Markup Language',w:['Secure Authentication Management Layer','Standard Access Markup Logging','System Authentication Markup Language']},
        {q:'TOTP',a:'Time-based One-Time Password',w:['Token One-Time Protocol','Temporary OTP','Two-Factor One-Time Password']},
        {q:'IPC',a:'Inter-Process Communication',w:['Internal Process Control','Inter-Protocol Channel','Integrated Process Core']},
        {q:'SPNEGO',a:'Simple and Protected GSSAPI Negotiation Mechanism',w:['Secure Protocol Negotiation Engine/Gateway Object','Single Pass Negotiation for GSSAPI Operations','Secure Protocol NTLM/GSSAPI Exchange Object']},
        {q:'LPAR',a:'Logical Partition',w:['Logical Process Address Registry','Linux Partition Access Record','Local Partition Allocation Resource']},
        {q:'DRS',a:'Distributed Resource Scheduler',w:['Data Replication Service','Dynamic Resource Sharing','Disaster Recovery System']},
        {q:'ACPI',a:'Advanced Configuration and Power Interface',w:['Automated Control and Power Integration','Advanced Computing Power Infrastructure','Application Configuration and Policy Interface']},
        {q:'SCSI',a:'Small Computer System Interface',w:['Standard Computer Storage Interface','System Control Storage Interface','Serial Computer System Integration']},
        {q:'BMC',a:'Baseboard Management Controller',w:['Basic Module Controller','Board Monitoring Console','Base Memory Controller']},
        {q:'DRBD',a:'Distributed Replicated Block Device',w:['Data Replication and Block Distribution','Distributed Remote Backup Device','Dynamic Replication Block Driver']},
        {q:'CIFS',a:'Common Internet File System',w:['Central Information File Service','Core Internet File Standard','Controlled Internet File System']},
      ]
    }
  },
  {
    id:'devops', name:'DevOps', color:'#2dff7a', tag:'DEVOPS', desc:'CI/CD, containers & automation',
    questions:{
      easy:[
        {q:'CI',a:'Continuous Integration',w:['Code Infrastructure','Container Interface','Cloud Integration']},
        {q:'CD',a:'Continuous Delivery',w:['Code Deployment','Container Daemon','Centralized Delivery']},
        {q:'API',a:'Application Programming Interface',w:['Application Protocol Integration','Automated Process Interface','Application Proxy Interface']},
        {q:'IaC',a:'Infrastructure as Code',w:['Integration as Container','Inventory as Code','Interface and Cloud']},
        {q:'SRE',a:'Site Reliability Engineering',w:['Security Reliability Engineering','Service Resilience Engineering','Software Release Engineering']},
        {q:'VCS',a:'Version Control System',w:['Virtual Container Service','Verified Code System','Version Compliance Standard']},
        {q:'SDK',a:'Software Development Kit',w:['System Deployment Kit','Secure Development Keys','Software Design Kit']},
        {q:'IDE',a:'Integrated Development Environment',w:['Interface Design Engine','Integrated Debugging Extension','Internal Development Engine']},
        {q:'PR',a:'Pull Request',w:['Process Request','Patch Release','Protocol Route']},
        {q:'YAML',a:"YAML Ain't Markup Language",w:['Yet Another Markup Language','Your Application Markup Language','Yet Another Module Layer']},
        {q:'REST',a:'Representational State Transfer',w:['Remote Execution Standard Transfer','Resource Exchange State Technology','Request Execution System Transfer']},
        {q:'JSON',a:'JavaScript Object Notation',w:['Java Serialized Object Node','JSON Structured Object Network','JavaScript Observable Node']},
        {q:'CLI',a:'Command Line Interface',w:['Client Login Interface','Configuration Layer Interface','Console Login Interface']},
        {q:'DNS',a:'Domain Name System',w:['Dynamic Network Service','Distributed Naming System','Domain Network Service']},
        {q:'TDD',a:'Test-Driven Development',w:['Total Deployment Design','Technical Documentation Development','Testing and Debugging Design']},
      ],
      medium:[
        {q:'MTTR',a:'Mean Time To Recovery',w:['Maximum Time To Recover','Minimum Transfer Rate','Mean Transfer Time Registry']},
        {q:'MTTF',a:'Mean Time To Failure',w:['Maximum Transfer Time Function','Minimum Time To Fix','Mean Total Transfer Frequency']},
        {q:'OWASP',a:'Open Worldwide Application Security Project',w:['Open Web Application Security Protocol','Online Web Application Security Platform','Open Worldwide Application Security Protocol']},
        {q:'OCI',a:'Open Container Initiative',w:['Official Container Interface','Open Cloud Instance','Orchestrated Container Integration']},
        {q:'CNI',a:'Container Network Interface',w:['Cloud Networking Integration','Core Node Interface','Container Node Interconnect']},
        {q:'HPA',a:'Horizontal Pod Autoscaler',w:['High-Performance Application','Horizontal Process Aggregator','Host Port Allocator']},
        {q:'SCA',a:'Software Composition Analysis',w:['Source Code Assessment','Static Code Analysis','Security Compliance Architecture']},
        {q:'SBOM',a:'Software Bill of Materials',w:['System Build Operations Manual','Software Backend Operations Monitor','Source Build Object Manifest']},
        {q:'DAST',a:'Dynamic Application Security Testing',w:['Distributed Application Security Testing','Dynamic Access Security Tool','Declarative Application Security Testing']},
        {q:'SAST',a:'Static Application Security Testing',w:['Secure Application Source Testing','System Application Security Testing','Standard Application Security Tool']},
        {q:'SLI',a:'Service Level Indicator',w:['Service Latency Index','System Load Indicator','Security Level Interface']},
        {q:'CSI',a:'Container Storage Interface',w:['Cloud Security Infrastructure','Core System Integration','Container System Index']},
        {q:'CRI',a:'Container Runtime Interface',w:['Cloud Resource Integration','Core Runtime Infrastructure','Container Registry Index']},
        {q:'VPA',a:'Vertical Pod Autoscaler',w:['Virtual Process Allocator','Verified Pod Administration','Volume Permission Allocator']},
        {q:'RBAC',a:'Role-Based Access Control',w:['Resource-Based Access Control','Rule-Based Authentication Check','Runtime Based Access Configuration']},
      ],
      hard:[
        {q:'eBPF',a:'Extended Berkeley Packet Filter',w:['Enhanced Binary Packet Filter','Extended Base Program Filter','Embedded Berkeley Protocol Filter']},
        {q:'OPA',a:'Open Policy Agent',w:['Orchestration Policy Architecture','Online Protocol Authenticator','OpenID Policy Agent']},
        {q:'mTLS',a:'Mutual Transport Layer Security',w:['Multi-Tenant Layer Security','Managed TLS','Microservices Transport Layer System']},
        {q:'CRD',a:'Custom Resource Definition',w:['Container Runtime Daemon','Cloud Resource Descriptor','Cluster Replication Domain']},
        {q:'SLSA',a:'Supply chain Levels for Software Artifacts',w:['Software Lifecycle Security Assessment','Source Level Security Architecture','Software Layered Security Architecture']},
        {q:'CNCF',a:'Cloud Native Computing Foundation',w:['Container Network Computing Framework','Cloud Network Control Foundation','Container Native Cloud Framework']},
        {q:'SPIRE',a:'SPIFFE Runtime Environment',w:['Security Protocol Integration Runtime Engine','Secure Platform Identity Runtime Extension','Single Platform Identity Relay Extension']},
        {q:'SLO',a:'Service Level Objective',w:['System Load Optimization','Service Latency Observer','Security Layer Orchestration']},
        {q:'CEL',a:'Common Expression Language',w:['Cloud Expression Logic','Centralized Evaluation Layer','Container Evaluation Language']},
        {q:'SSCS',a:'Software Supply Chain Security',w:['Secure Source Control System','Single Sign-in Continuous Security','Service-to-Service Communication Security']},
        {q:'SPIFFE',a:'Secure Production Identity Framework for Everyone',w:['Secure Platform Identity Federation Framework','Standard Production Identity Format Extension','Secure Production Infrastructure Framework']},
        {q:'KEDA',a:'Kubernetes Event-Driven Autoscaling',w:['Kubernetes Enterprise Deployment Agent','Kubernetes External Data Adapter','Kubernetes Endpoint Discovery Agent']},
        {q:'ArgoCD',a:'Argo Continuous Delivery',w:['Automated Resource Gateway Operations','Application Release Grid Orchestration','Argo Container Deployment']},
        {q:'IRSA',a:'IAM Roles for Service Accounts',w:['Integrated Role Security Architecture','Identity and Role Service Agent','Infrastructure Role Security Allocation']},
        {q:'PSP',a:'Pod Security Policy',w:['Platform Security Protocol','Process Security Permission','Protected Service Policy']},
      ]
    }
  },
  {
    id:'cloud', name:'Cloud Computing', color:'#00bfff', tag:'CLOUD', desc:'Cloud platforms, storage & services',
    questions:{
      easy:[
        {q:'IaaS',a:'Infrastructure as a Service',w:['Integration as a Service','Internet as a Service','Instance as a Service']},
        {q:'PaaS',a:'Platform as a Service',w:['Process as a Service','Protocol as a Service','Proxy as a Service']},
        {q:'SaaS',a:'Software as a Service',w:['System as a Service','Storage as a Service','Security as a Service']},
        {q:'CDN',a:'Content Delivery Network',w:['Core Data Network','Centralized Delivery Node','Cloud Distribution Network']},
        {q:'IAM',a:'Identity and Access Management',w:['Internal Access Module','Integrated Authentication Management','Infrastructure Access Matrix']},
        {q:'VPC',a:'Virtual Private Cloud',w:['Virtual Protocol Channel','Verified Private Cloud','Virtual Proxy Configuration']},
        {q:'S3',a:'Simple Storage Service',w:['Secure Server Service','Scalable Storage System','Standard Storage Solution']},
        {q:'EC2',a:'Elastic Compute Cloud',w:['External Compute Control','Enterprise Compute Cloud','Enhanced Compute Container']},
        {q:'RDS',a:'Relational Database Service',w:['Remote Data System','Redundant Data Store','Remote Desktop Service']},
        {q:'WAF',a:'Web Application Firewall',w:['Wide Area Firewall','Web Access Filter','Wireless Authentication Framework']},
        {q:'ELB',a:'Elastic Load Balancer',w:['Extended Load Bridge','Enterprise Load Balancer','Elastic Link Bridge']},
        {q:'DNS',a:'Domain Name System',w:['Dynamic Network Service','Distributed Naming System','Domain Network Service']},
        {q:'VM',a:'Virtual Machine',w:['Volume Manager','Virtual Memory','Verified Module']},
        {q:'ARN',a:'Amazon Resource Name',w:['Application Resource Node','Access Resource Number','Automated Resource Notation']},
        {q:'AZ',a:'Availability Zone',w:['Access Zone','Authorization Zone','Application Zone']},
      ],
      medium:[
        {q:'CSP',a:'Cloud Service Provider',w:['Content Security Policy','Core Security Platform','Certificate Service Provider']},
        {q:'CWPP',a:'Cloud Workload Protection Platform',w:['Cloud-Wide Privacy Protocol','Central Workload Permission Policy','Cloud Workload Performance Platform']},
        {q:'CSPM',a:'Cloud Security Posture Management',w:['Cloud Service Permission Manager','Central Security Policy Management','Cloud Security Protocol Manager']},
        {q:'FaaS',a:'Function as a Service',w:['Framework as a Service','Firewall as a Service','File as a Service']},
        {q:'RTO',a:'Recovery Time Objective',w:['Real-Time Optimization','Replication Transfer Operation','Routing Time Order']},
        {q:'RPO',a:'Recovery Point Objective',w:['Replication Protocol Order','Retained Point Operation','Restore Point Order']},
        {q:'EKS',a:'Elastic Kubernetes Service',w:['Extended Kubernetes System','Enterprise Kubernetes Service','External Kubernetes Scheduling']},
        {q:'AKS',a:'Azure Kubernetes Service',w:['Advanced Kubernetes Scheduling','Automated Kubernetes System','Application Kubernetes Service']},
        {q:'GKE',a:'Google Kubernetes Engine',w:['Global Kubernetes Extension','Generalized Kubernetes Engine','Grid Kubernetes Environment']},
        {q:'DR',a:'Disaster Recovery',w:['Data Replication','Dynamic Routing','Data Repository']},
        {q:'NACl',a:'Network Access Control List',w:['Network Authorization Control Layer','Node Access Configuration List','Network Automated Control Log']},
        {q:'ASG',a:'Auto Scaling Group',w:['Application Security Group','Automated Service Gateway','Advanced Security Group']},
        {q:'AMI',a:'Amazon Machine Image',w:['Application Management Instance','Automated Machine Integration','Amazon Managed Infrastructure']},
        {q:'SKU',a:'Stock Keeping Unit',w:['Service Key Unit','System Kernel Unit','Standard Key Utility']},
        {q:'MaaS',a:'Metal as a Service',w:['Monitoring as a Service','Management as a Service','Migration as a Service']},
      ],
      hard:[
        {q:'CNAPP',a:'Cloud Native Application Protection Platform',w:['Cloud Node Application Policy Protocol','Container Native Access Point Protection','Cloud Network Application Permission Profile']},
        {q:'DSPM',a:'Data Security Posture Management',w:['Dynamic Security Policy Manager','Distributed Security Platform Management','Data System Permission Monitor']},
        {q:'SASE',a:'Secure Access Service Edge',w:['Secure Application Security Engine','Standard Access Security Endpoint','Security Architecture Service Exchange']},
        {q:'SSE',a:'Security Service Edge',w:['Secure Session Engine','Single Sign-in Extension','Stateless Scripting Engine']},
        {q:'CIEM',a:'Cloud Infrastructure Entitlement Management',w:['Cloud Identity and Event Management','Container Identity Enforcement Mechanism','Core Infrastructure Entitlement Monitor']},
        {q:'WAAP',a:'Web Application and API Protection',w:['Wide-Area Application Protocol','Web Access Authentication Platform','Web Application API Policy']},
        {q:'NSG',a:'Network Security Group',w:['Node Security Gateway','Network Segmentation Group','Namespace Security Gate']},
        {q:'WAFR',a:'Well-Architected Framework Review',w:['Web Application Firewall Rules','Workflow Automation Framework Review','Wide-Area Framework Review']},
        {q:'BaaS',a:'Backend as a Service',w:['Backup as a Service','Batch as a Service','Binary as a Service']},
        {q:'BYOC',a:'Bring Your Own Cloud',w:['Build Your Own Container','Bring Your Own Credentials','Build Your Own Cluster']},
        {q:'GWLB',a:'Gateway Load Balancer',w:['Global Web Load Bridge','Gateway Weighted Load Bridge','Generic Workload Load Balancer']},
        {q:'PrivateLink',a:'Private Link',w:['Private Load Infrastructure Network Key','Private Lightweight Network Kernel','Protected Link']},
        {q:'MRAP',a:'Multi-Region Access Point',w:['Managed Resource Access Protocol','Multi-Region Application Policy','Managed Recovery Access Point']},
        {q:'SCU',a:'Savings Compute Unit',w:['Service Configuration Unit','Standard Compute Utility','System Control Unit']},
        {q:'PAYG',a:'Pay As You Go',w:['Pre-Authorized Yearly Grant','Platform Allocation Yield Guarantee','Provision And Yield Guarantee']},
      ]
    }
  },
  {
    id:'crypto', name:'Cryptography', color:'#ff9900', tag:'CRYPTO', desc:'Encryption, hashing & protocols',
    questions:{
      easy:[
        {q:'AES',a:'Advanced Encryption Standard',w:['Automated Encryption System','Applied Encryption Standard','Advanced Exchange Security']},
        {q:'RSA',a:'Rivest-Shamir-Adleman',w:['Random Security Algorithm','Redundant Security Architecture','Robust Security Association']},
        {q:'SHA',a:'Secure Hash Algorithm',w:['Simple Hashing Architecture','Standard Hash Application','Secure Host Authentication']},
        {q:'MD5',a:'Message Digest 5',w:['Managed Data 5','Modular Digest System 5','Multiple Data 5']},
        {q:'SSL',a:'Secure Sockets Layer',w:['Standard Security Layer','Secure Session Link','System Security Layer']},
        {q:'TLS',a:'Transport Layer Security',w:['Transfer Link Security','Terminal Layer Security','Transmission Level Security']},
        {q:'PGP',a:'Pretty Good Privacy',w:['Protected Group Policy','Private Gateway Protocol','Primary Guard Protocol']},
        {q:'OTP',a:'One-Time Password',w:['Open Token Protocol','Offline Transfer Protocol','One-Time Pass']},
        {q:'IV',a:'Initialization Vector',w:['Internal Validation','Identity Verification','Initial Value']},
        {q:'GPG',a:'GNU Privacy Guard',w:['General Privacy Gateway','Global Privacy Guard','Group Policy Guard']},
        {q:'DES',a:'Data Encryption Standard',w:['Digital Encryption System','Dynamic Encryption Standard','Distributed Encryption Service']},
        {q:'CBC',a:'Cipher Block Chaining',w:['Core Block Cipher','Controlled Block Chaining','Cryptographic Block Control']},
        {q:'CTR',a:'Counter Mode',w:['Cipher Transfer Rate','Controlled Transfer Run','Core Transmission Rate']},
        {q:'MAC',a:'Message Authentication Code',w:['Media Access Control','Managed Access Certificate','Multi-Agent Control']},
        {q:'GCM',a:'Galois/Counter Mode',w:['General Cipher Module','Global Counter Management','Generic Cryptographic Mode']},
      ],
      medium:[
        {q:'ECC',a:'Elliptic Curve Cryptography',w:['Enhanced Cipher Control','External Certificate Chain','Encrypted Certificate Check']},
        {q:'ECDH',a:'Elliptic Curve Diffie-Hellman',w:['Enhanced Certificate Data Hash','Extended Cryptographic Data Handler','Encrypted Channel Diffie-Hellman']},
        {q:'HMAC',a:'Hash-based Message Authentication Code',w:['Host-based Message Access Control','Hashed Management Authentication Certificate','Hybrid Message Authentication Check']},
        {q:'KDF',a:'Key Derivation Function',w:['Key Distribution Format','Key Data File','Keystore Definition Format']},
        {q:'HSM',a:'Hardware Security Module',w:['High Security Management','Host Security Module','Hash Security Manager']},
        {q:'PBKDF2',a:'Password-Based Key Derivation Function 2',w:['Packet-Based Key Data Format 2','Protocol-Based Key Distribution Framework 2','Password Block Key Derivation Format 2']},
        {q:'KEK',a:'Key Encryption Key',w:['Kernel Encryption Key','Keyed Encryption Kit','Key Exchange Key']},
        {q:'ECDSA',a:'Elliptic Curve Digital Signature Algorithm',w:['Encrypted Certificate Digital Security Access','Extended Certificate Data Signature Authentication','Elliptic Curve Data Signing Architecture']},
        {q:'FIDO',a:'Fast IDentity Online',w:['Federal Identity Online','Federated Identity and Decentralized Operations','Flexible Identity Domain Online']},
        {q:'DEK',a:'Data Encryption Key',w:['Digital Encryption Key','Domain Encryption Key','Default Encryption Key']},
        {q:'CMAC',a:'Cipher-based Message Authentication Code',w:['Centralized MAC','Controlled Message Authentication Code','Core Message Access Control']},
        {q:'AEAD',a:'Authenticated Encryption with Associated Data',w:['Advanced Encryption and Authentication Design','Automated Encryption and Authentication Device','Adaptive Encryption with Associated Data']},
        {q:'CRL',a:'Certificate Revocation List',w:['Cryptographic Registry Log','Certificate Renewal Log','Core Revocation Layer']},
        {q:'OCSP',a:'Online Certificate Status Protocol',w:['Online Cryptographic Security Protocol','Open Certificate Signing Protocol','Online Certificate Signing Process']},
        {q:'CSR',a:'Certificate Signing Request',w:['Cryptographic Security Report','Certificate Security Registry','Core Signing Resource']},
      ],
      hard:[
        {q:'ZKP',a:'Zero-Knowledge Proof',w:['Zone Key Protocol','Zero Key Processing','Zonal Knowledge Protocol']},
        {q:'PAKE',a:'Password Authenticated Key Exchange',w:['Public Access Key Enforcement','Preshared Authentication Key Extension','Protocol Authenticated Key Encapsulation']},
        {q:'IBE',a:'Identity-Based Encryption',w:['Internet-Based Encryption','Integrated Block Encryption','Index-Based Encryption']},
        {q:'HKDF',a:'HMAC-based Key Derivation Function',w:['Hash-Key Distribution Format','Hosted Key Derivation Framework','Hardened Key Derivation Format']},
        {q:'LWE',a:'Learning With Errors',w:['Linked Workload Engine','Layer-Wide Encryption','Local Write Engine']},
        {q:'PQC',a:'Post-Quantum Cryptography',w:['Partial Quantum Control','Protocol Quantum Channel','Pre-Quantum Cryptography']},
        {q:'ABE',a:'Attribute-Based Encryption',w:['Application-Based Encryption','Access-Block Encryption','Agent-Based Encryption']},
        {q:'SIDH',a:'Supersingular Isogeny Diffie-Hellman',w:['Secure Integer Diffie-Hellman','Semi-public Identity Diffie-Hellman','Single Integer Derived Hash']},
        {q:'NTRU',a:'Nth-degree TRUncated polynomial ring',w:['Next-gen TRUsted Unit','Network Traffic Routing Unit','Node Trust Registry Utility']},
        {q:'MPC',a:'Multi-Party Computation',w:['Managed Protocol Cryptography','Multi-Pass Cipher','Modular Protocol Channel']},
        {q:'FPE',a:'Format-Preserving Encryption',w:['Fixed Polynomial Encryption','File Protection Encryption','Fast Processing Encryption']},
        {q:'FHE',a:'Fully Homomorphic Encryption',w:['Fast Hashing Encryption','Flexible Hash Encryption','Forward Hashing Engine']},
        {q:'STS',a:'Station-to-Station protocol',w:['Secure Token Service','Standard Transfer Security','Synchronized Token System']},
        {q:'KMIP',a:'Key Management Interoperability Protocol',w:['Key Monitoring and Integration Protocol','Kernel Management Interface Protocol','Key Migration and Import Protocol']},
        {q:'XTS',a:'XEX-based Tweaked-codebook mode with ciphertext Stealing',w:['eXtended Transport Security','eXtended Token Security','XML Transfer Standard']},
      ]
    }
  },
  {
    id:'pentest', name:'Pentesting', color:'#ff2d4a', tag:'PENTEST', desc:'Offensive security & red teaming',
    questions:{
      easy:[
        {q:'PoC',a:'Proof of Concept',w:['Point of Compromise','Port of Control','Protocol of Compromise']},
        {q:'RCE',a:'Remote Code Execution',w:['Remote Control Engine','Remote Command Encryption','Routed Control Execution']},
        {q:'LFI',a:'Local File Inclusion',w:['Logical File Injection','Local Firewall Inspection','Local File Integrity']},
        {q:'RFI',a:'Remote File Inclusion',w:['Remote File Injection','Remote Firewall Inspection','Remote File Integrity']},
        {q:'IDOR',a:'Insecure Direct Object Reference',w:['Internal Domain Object Routing','Index-based Direct Object Routing','Insecure Data Object Relay']},
        {q:'XXE',a:'XML External Entity',w:['eXtended XML Encryption','Extra XML Engine','eXchangeable XML Element']},
        {q:'RAT',a:'Remote Access Trojan',w:['Remote Access Tool','Routed Access Terminal','Remote Audit Tool']},
        {q:'MITM',a:'Man-in-the-Middle',w:['Managed Intrusion Threat Model','Multi-Instance Traffic Monitor','Machine Instruction Transfer Method']},
        {q:'BAS',a:'Breach and Attack Simulation',w:['Baseline Attack Scoring','Background Attack System','Behavior Analysis Simulation']},
        {q:'SQLi',a:'SQL Injection',w:['SQL Integration','SQL Interface','SQL Indexing']},
        {q:'CVE',a:'Common Vulnerabilities and Exposures',w:['Critical Vulnerability Exploit','Central Vulnerability Engine','Common Virus Enumeration']},
        {q:'CTF',a:'Capture The Flag',w:['Centralized Threat Framework','Controlled Testing Framework','Certified Threat Finding']},
        {q:'OSINT',a:'Open Source Intelligence',w:['Operational Security Intelligence','Online Security Intrusion Toolkit','Open System Information Network']},
        {q:'WAF',a:'Web Application Firewall',w:['Wide Area Firewall','Web Access Filter','Wireless Authentication Framework']},
        {q:'BOF',a:'Buffer Overflow',w:['Basic Output Function','Binary Operation Failure','Batch Operation Framework']},
      ],
      medium:[
        {q:'OSCP',a:'Offensive Security Certified Professional',w:['Open Security Certification Protocol','Offensive System Compliance Platform','Online Security Certified Practitioner']},
        {q:'LSASS',a:'Local Security Authority Subsystem Service',w:['Local System Authentication Sub-Service','Logical Security Access Subsystem Service','Local Session Authority Security Service']},
        {q:'NTLM',a:'New Technology LAN Manager',w:['Network Token Login Module','New Technology Login Manager','Network Trusted Layer Manager']},
        {q:'PAC',a:'Privilege Attribute Certificate',w:['Password Access Control','Protocol Authentication Certificate','Process Attribute Control']},
        {q:'RBCD',a:'Resource-Based Constrained Delegation',w:['Role-Based Control Domain','Remote Batch Control Delegation','Resource Block Certificate Domain']},
        {q:'DLL',a:'Dynamic Link Library',w:['Domain Link Layer','Direct Load Library','Data Linked Layer']},
        {q:'UAC',a:'User Account Control',w:['User Authentication Check','Unified Access Control','User Authorization Cache']},
        {q:'PTH',a:'Pass The Hash',w:['Pass To Host','Protocol Token Handler','Path Transfer Hash']},
        {q:'PTT',a:'Pass The Ticket',w:['Protocol Token Transfer','Pass Token Through','Persistent Ticket Token']},
        {q:'ACE',a:'Access Control Entry',w:['Authenticated Credential Entry','Access Certificate Exchange','Application Control Engine']},
        {q:'SPN',a:'Service Principal Name',w:['Security Protocol Node','Secure Process Name','Service Policy Number']},
        {q:'TGT',a:'Ticket Granting Ticket',w:['Token Generation Tool','Trusted Gateway Token','Ticket Generation Transfer']},
        {q:'TGS',a:'Ticket Granting Service',w:['Token Generation Service','Trusted Gateway System','Ticket Generation System']},
        {q:'DACL',a:'Discretionary Access Control List',w:['Dynamic Access Control Layer','Data Access Control Log','Domain Access Control List']},
        {q:'SAM',a:'Security Account Manager',w:['System Authentication Module','Secure Access Manager','Standard Authentication Module']},
      ],
      hard:[
        {q:'LOLBAS',a:'Living Off the Land Binaries and Scripts',w:['Local Offline Loader Binary and Script','Linux Operating Loader Binary Archive System','Level Offensive Loader Binaries and System']},
        {q:'AMSI',a:'Antimalware Scan Interface',w:['Advanced Malware Security Intelligence','Application Managed Security Interface','Automated Malware Scan Infrastructure']},
        {q:'ETW',a:'Event Tracing for Windows',w:['Extended Thread Watching','Event Telemetry Windows','Endpoint Tracking for Windows']},
        {q:'PPL',a:'Protected Process Light',w:['Privileged Process Layer','Platform Protection Level','Process Permission Layer']},
        {q:'SACL',a:'System Access Control List',w:['Secure Access Control Layer','Service Account Control Log','Session Access Control List']},
        {q:'VEH',a:'Vectored Exception Handler',w:['Virtual Execution Handler','Verified Exception Hook','Volatile Exception Handler']},
        {q:'PPID',a:'Parent Process ID',w:['Primary Privilege ID','Process Permission ID','Protected Process Identifier']},
        {q:'TPM',a:'Trusted Platform Module',w:['Threat Protection Module','Terminal Process Manager','Token Permission Module']},
        {q:'DPAPI',a:'Data Protection Application Programming Interface',w:['Data Privacy Access Point Interface','Dynamic Protection Application Programming Interface','Data Protection Access Protocol Interface']},
        {q:'WDAC',a:'Windows Defender Application Control',w:['Windows Data Access Control','Windows Defender Audit Configuration','Windows Device Application Control']},
        {q:'HWBP',a:'Hardware Breakpoint',w:['Host Web Bypass Protocol','Hardware Bypass Process','Hosted Workflow Breakpoint']},
        {q:'ROP',a:'Return-Oriented Programming',w:['Remote Operation Protocol','Runtime Object Processing','Reverse Output Processing']},
        {q:'PEB',a:'Process Environment Block',w:['Protected Execution Base','Primary Execution Buffer','Process Event Bridge']},
        {q:'TEB',a:'Thread Environment Block',w:['Trusted Execution Base','Thread Event Bridge','Terminal Environment Buffer']},
        {q:'CFG',a:'Control Flow Guard',w:['Configuration File Group','Core Function Guard','Centralized Flow Gateway']},
      ]
    }
  },
  {
    id:'database', name:'Databases', color:'#ff7700', tag:'DB', desc:'Queries, storage & DB systems',
    questions:{
      easy:[
        {q:'DB',a:'Database',w:['Data Buffer','Data Bus','Digital Base']},
        {q:'RDBMS',a:'Relational Database Management System',w:['Remote Database Management System','Redundant Database Module Service','Real-time Database Management Service']},
        {q:'CRUD',a:'Create Read Update Delete',w:['Core Runtime User Data','Controlled Resource User Data','Client Runtime Update Data']},
        {q:'DDL',a:'Data Definition Language',w:['Dynamic Data Language','Database Definition Library','Data Domain Language']},
        {q:'DML',a:'Data Manipulation Language',w:['Database Management Language','Dynamic Module Language','Data Model Language']},
        {q:'ACID',a:'Atomicity Consistency Isolation Durability',w:['Access Control Identity Domain','Automated Consistency Index Data','Advanced Cryptographic ID']},
        {q:'ORM',a:'Object-Relational Mapping',w:['Object Resource Manager','Object Registry Model','Operational Relational Module']},
        {q:'OLTP',a:'Online Transaction Processing',w:['Offline Transaction Processing','Online Transfer Protocol','Optimized Legacy Transaction Protocol']},
        {q:'OLAP',a:'Online Analytical Processing',w:['Offline Analytical Processing','Object Layer Application Protocol','Optimized Layer Analysis Protocol']},
        {q:'ETL',a:'Extract Transform Load',w:['Enterprise Transaction Log','Event Tracking Layer','Extended Transfer Layer']},
        {q:'SQL',a:'Structured Query Language',w:['Standard Query Logic','System Query Language','Sequential Queue List']},
        {q:'CSV',a:'Comma-Separated Values',w:['Core System Values','Controlled Storage Values','Central Stored Variables']},
        {q:'DCL',a:'Data Control Language',w:['Dynamic Configuration Language','Database Command Layer','Data Connection Language']},
        {q:'TCL',a:'Transaction Control Language',w:['Transfer Control Layer','Table Configuration Language','Transaction Command Log']},
        {q:'XML',a:'Extensible Markup Language',w:['eXternal Module Language','eXecutable Markup Logic','eXtended Management Language']},
      ],
      medium:[
        {q:'CAP',a:'Consistency Availability Partition tolerance',w:['Centralized Access Protocol','Core Authentication Platform','Controlled Access Point']},
        {q:'MVCC',a:'Multi-Version Concurrency Control',w:['Multi-View Cache Control','Managed Version Control Check','Monitored Version Consistency Control']},
        {q:'WAL',a:'Write-Ahead Logging',w:['Wide Area Log','Workload Abstraction Layer','Web Access Log']},
        {q:'JSON',a:'JavaScript Object Notation',w:['Java Serialized Object Node','Java Secure Object Network','JavaScript Observable Node']},
        {q:'BSON',a:'Binary JSON',w:['Base Serialized Object Notation','Block Stored Object Node','Buffered Serialized Object Network']},
        {q:'CDC',a:'Change Data Capture',w:['Central Data Control','Core Database Channel','Centralized Data Collection']},
        {q:'PK',a:'Primary Key',w:['Protocol Key','Process Key','Partial Key']},
        {q:'FK',a:'Foreign Key',w:['Final Key','Framework Key','File Key']},
        {q:'NoSQL',a:'Not Only SQL',w:['No Structured Query Language','Non-relational SQL','No SQL at all']},
        {q:'IOPS',a:'Input/Output Operations Per Second',w:['Internal Operations Performance Score','Integrated Output Processing System','Index Operations Per Snapshot']},
        {q:'CTE',a:'Common Table Expression',w:['Controlled Table Execution','Core Table Entry','Cached Table Expression']},
        {q:'DAG',a:'Directed Acyclic Graph',w:['Data Access Group','Dynamic Allocation Graph','Distributed Access Gateway']},
        {q:'TTL',a:'Time To Live',w:['Total Transfer Limit','Transaction Token Lifetime','Temporal Transfer Lock']},
        {q:'UDF',a:'User-Defined Function',w:['Unified Data Format','Universal Data Framework','User Data File']},
        {q:'DDL',a:'Data Definition Language',w:['Dynamic Data Language','Database Definition Library','Data Domain Language']},
      ],
      hard:[
        {q:'LSM',a:'Log-Structured Merge-tree',w:['Large Scale Model','Log-Stored Module','Layered Storage Model']},
        {q:'HTAP',a:'Hybrid Transactional and Analytical Processing',w:['Horizontal Transactional Access Protocol','High-Throughput Analytical Platform','Hybrid Transactional Application Pipeline']},
        {q:'PITR',a:'Point-in-Time Recovery',w:['Parallel In-Transaction Replication','Partitioned Iteration Transfer Recovery','Protocol Integrated Transfer Restore']},
        {q:'CRDT',a:'Conflict-free Replicated Data Type',w:['Controlled Replicated Data Transfer','Core Redundant Data Transfer','Compressed Replicated Data Type']},
        {q:'TDE',a:'Transparent Data Encryption',w:['Total Data Encryption','Transactional Data Encoding','Trusted Data Encryption']},
        {q:'MPP',a:'Massively Parallel Processing',w:['Multi-Point Processing','Managed Parallel Protocol','Multi-Partition Processing']},
        {q:'XID',a:'Transaction ID',w:['eXtended Index Data','External Interface Daemon','eXecution Instance Descriptor']},
        {q:'SSTables',a:'Sorted String Tables',w:['Structured Storage Tables','Static Schema Tables','Server-Side Storage Tables']},
        {q:'BCNF',a:'Boyce-Codd Normal Form',w:['Base Canonical Normalization Form','Binary Compressed Normal Format','Block-Consistent Normal Form']},
        {q:'RLS',a:'Row-Level Security',w:['Resource-Level Security','Record Lock System','Relational Lock Security']},
        {q:'SSI',a:'Snapshot Isolation',w:['Server-Side Integration','Standard System Isolation','Synchronized State Index']},
        {q:'FDW',a:'Foreign Data Wrapper',w:['Federated Data Worker','Forward Data Writer','Flexible Data Wrapper']},
        {q:'GIN',a:'Generalized Inverted Index',w:['Global Information Node','General Index Network','Graph Inverted Node']},
        {q:'GiST',a:'Generalized Search Tree',w:['Global Index Search Table','Graph Indexed Storage Tree','Generic Structured Tree']},
        {q:'BRIN',a:'Block Range Index',w:['Binary Range Insertion Node','Base Range Index Node','Block Reference Index']},
      ]
    }
  }
];

// ── State ─────────────────────────────────────────────────
let state = {
  currentCat: null,
  currentDiff: null,
  questions: [],
  currentIdx: 0,
  score: 0,
  results: [],
  answered: false
};

let coalPromptTimer = null;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getGrade(pct) {
  if (pct >= 95) return { g: 'S', v: 'FLAWLESS EXECUTION' };
  if (pct >= 80) return { g: 'A', v: 'EXPERT KNOWLEDGE' };
  if (pct >= 65) return { g: 'B', v: 'SOLID PERFORMANCE' };
  if (pct >= 50) return { g: 'C', v: 'NEEDS WORK' };
  if (pct >= 30) return { g: 'D', v: 'BARELY PASSING' };
  return { g: 'F', v: 'HIT THE BOOKS' };
}

function showScreen(id) {
  document.querySelectorAll('.qz-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function showHome() {
  showScreen('home');
  document.getElementById('sb-category').textContent = '// STANDBY';
  document.getElementById('sb-score').textContent = 'SCORE: 0';
  state.score = 0;
}

function stareAtCoals() {
  if (coalPromptTimer) {
    clearTimeout(coalPromptTimer);
    coalPromptTimer = null;
  }

  const root = document.getElementById('quiz-root');
  if (!root || root.classList.contains('coal-vanishing') || root.classList.contains('coal-hidden')) return;

  const prompt = document.getElementById('coal-prompt');
  if (prompt) prompt.classList.remove('show');

  document.body.classList.add('coals-mode');
  root.classList.add('coal-vanishing');
  root.addEventListener('animationend', () => {
    root.classList.add('coal-hidden');
  }, { once: true });

  coalPromptTimer = setTimeout(() => {
    if (!document.body.classList.contains('coals-mode')) return;
    const coalPrompt = document.getElementById('coal-prompt');
    if (coalPrompt) coalPrompt.classList.add('show');
  }, 8000);
}

let grillPromptTimer = null;

function keepStaringAtCoals() {
  const coalPrompt = document.getElementById('coal-prompt');
  if (coalPrompt) coalPrompt.classList.remove('show');

  grillPromptTimer = setTimeout(() => {
    if (!document.body.classList.contains('coals-mode')) return;
    const gp = document.getElementById('grill-prompt');
    if (gp) gp.classList.add('show');
  }, 3000);
}

function grillYes() {
  const gp = document.getElementById('grill-prompt');
  if (gp) gp.classList.remove('show');
  const sausage = document.getElementById('grill-sausage');
  if (sausage) sausage.classList.add('slide-in');
}

function grillNo() {
  const gp = document.getElementById('grill-prompt');
  if (gp) gp.classList.remove('show');
  const sausage = document.getElementById('grill-sausage');
  if (sausage) sausage.classList.add('slide-in');

  sausage.addEventListener('transitionend', () => {
    if (!document.body.classList.contains('coals-mode')) return;
    const msg = document.getElementById('grill-msg');
    if (msg) msg.classList.add('show');
    setTimeout(() => {
      if (!msg) return;
      msg.classList.add('vanishing');
      msg.addEventListener('animationend', () => {
        msg.classList.remove('show', 'vanishing');
      }, { once: true });
    }, 3000);
  }, { once: true });
}

function returnFromCoals() {
  if (coalPromptTimer) {
    clearTimeout(coalPromptTimer);
    coalPromptTimer = null;
  }

  if (grillPromptTimer) { clearTimeout(grillPromptTimer); grillPromptTimer = null; }

  const prompt = document.getElementById('coal-prompt');
  if (prompt) prompt.classList.remove('show');

  const gp = document.getElementById('grill-prompt');
  if (gp) gp.classList.remove('show');

  const sausage = document.getElementById('grill-sausage');
  if (sausage) sausage.classList.remove('slide-in');

  const grillMsg = document.getElementById('grill-msg');
  if (grillMsg) grillMsg.classList.remove('show');

  const root = document.getElementById('quiz-root');
  if (!root) return;

  document.body.classList.remove('coals-mode');
  root.classList.remove('coal-hidden', 'coal-vanishing');
  root.classList.add('coal-returning');
  root.addEventListener('animationend', () => {
    root.classList.remove('coal-returning');
  }, { once: true });
}

function buildHome() {
  const grid = document.getElementById('cat-grid');
  grid.innerHTML = '';
  let total = 0;
  CATEGORIES.forEach(cat => {
    const count = cat.questions.easy.length + cat.questions.medium.length + cat.questions.hard.length;
    total += count;
    const card = document.createElement('div');
    card.className = 'cat-card';
    card.style.setProperty('--c', cat.color);
    card.innerHTML = `<span class="cat-tag">${cat.tag}</span><div class="cat-name">${cat.name}</div><div class="cat-count">${count} questions</div>`;
    card.addEventListener('click', () => selectCategory(cat.id));
    grid.appendChild(card);
  });
  document.getElementById('total-q-count').textContent = total + '+';
}

function selectCategory(catId) {
  const cat = CATEGORIES.find(c => c.id === catId);
  state.currentCat = cat;
  document.getElementById('diff-name').textContent = cat.name;
  document.getElementById('diff-sub').textContent = cat.desc;
  document.getElementById('diff-easy-count').textContent = cat.questions.easy.length + ' questions';
  document.getElementById('diff-med-count').textContent = cat.questions.medium.length + ' questions';
  document.getElementById('diff-hard-count').textContent = cat.questions.hard.length + ' questions';
  document.getElementById('sb-category').textContent = '// ' + cat.tag;
  showScreen('difficulty');
}

function startQuiz(difficulty) {
  const cat = state.currentCat;
  state.currentDiff = difficulty;
  state.questions = shuffle(cat.questions[difficulty]);
  state.currentIdx = 0;
  state.score = 0;
  state.results = [];
  document.getElementById('qm-cat').textContent = cat.name;
  document.getElementById('qm-diff').textContent = difficulty.toUpperCase();
  document.getElementById('sb-score').textContent = 'SCORE: 0';
  const segs = document.getElementById('prog-segs');
  segs.innerHTML = '';
  state.questions.forEach((_, i) => {
    const seg = document.createElement('div');
    seg.className = 'seg' + (i === 0 ? ' current' : '');
    seg.id = 'seg-' + i;
    segs.appendChild(seg);
  });
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = state.questions[state.currentIdx];
  const total = state.questions.length;
  const idx = state.currentIdx;
  document.getElementById('prog-text').textContent = `${idx} / ${total}`;
  document.getElementById('prog-fill').style.width = `${(idx / total) * 100}%`;
  document.getElementById('q-number').textContent = `QUESTION ${idx + 1} OF ${total}`;
  document.getElementById('q-acronym').textContent = q.q;
  const fb = document.getElementById('feedback-bar');
  fb.classList.remove('show', 'correct', 'wrong');
  document.getElementById('next-btn').classList.remove('show');
  const letters = ['A', 'B', 'C', 'D'];
  const all = shuffle([q.a, ...q.w]);
  const grid = document.getElementById('answers-grid');
  grid.innerHTML = '';
  all.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'ans-btn';
    btn.innerHTML = `<span class="ans-letter">${letters[i]}</span><span class="ans-text">${ans}</span>`;
    btn.addEventListener('click', () => selectAnswer(btn, ans, q.a));
    grid.appendChild(btn);
  });
  state.answered = false;
}

function selectAnswer(btn, selected, correct) {
  if (state.answered) return;
  state.answered = true;
  const isCorrect = selected === correct;
  document.querySelectorAll('.ans-btn').forEach(b => {
    b.disabled = true;
    const text = b.querySelector('.ans-text').textContent;
    if (text === correct) b.classList.add('correct');
    else if (b === btn && !isCorrect) b.classList.add('wrong');
  });
  state.results.push(isCorrect ? 'correct' : 'wrong');
  const segEl = document.getElementById('seg-' + state.currentIdx);
  if (segEl) { segEl.classList.remove('current'); segEl.classList.add(isCorrect ? 'correct' : 'wrong'); }
  const nextSeg = document.getElementById('seg-' + (state.currentIdx + 1));
  if (nextSeg) nextSeg.classList.add('current');
  if (isCorrect) {
    const pts = { easy: 10, medium: 20, hard: 35 };
    state.score += (pts[state.currentDiff] || 10);
    document.getElementById('sb-score').textContent = 'SCORE: ' + state.score;
  }
  const fb = document.getElementById('feedback-bar');
  if (isCorrect) {
    fb.className = 'feedback-bar show correct';
    document.getElementById('feedback-text').textContent = 'Correct — ' + correct;
  } else {
    fb.className = 'feedback-bar show wrong';
    document.getElementById('feedback-text').innerHTML = `Wrong. <span class="feedback-correct-ans">${correct}</span>`;
  }
  const nb = document.getElementById('next-btn');
  nb.classList.add('show');
  nb.textContent = state.currentIdx === state.questions.length - 1 ? 'SEE RESULTS' : 'NEXT QUESTION';
}

function nextQuestion() {
  state.currentIdx++;
  if (state.currentIdx >= state.questions.length) { showResults(); }
  else { renderQuestion(); }
}

function showResults() {
  const total = state.questions.length;
  const correct = state.results.filter(r => r === 'correct').length;
  const wrong = total - correct;
  const pct = Math.round((correct / total) * 100);
  const { g, v } = getGrade(pct);
  document.getElementById('res-grade').textContent = g;
  document.getElementById('res-grade').className = 'result-grade grade-' + g;
  document.getElementById('res-verdict').textContent = v;
  document.getElementById('res-score').innerHTML = `${state.score}<span> pts</span>`;
  document.getElementById('res-sub').textContent = `${state.currentCat.name.toUpperCase()} \u00B7 ${state.currentDiff.toUpperCase()} DIFFICULTY`;
  document.getElementById('rb-correct').textContent = correct;
  document.getElementById('rb-wrong').textContent = wrong;
  document.getElementById('rb-acc').textContent = pct + '%';
  document.getElementById('prog-fill').style.width = '100%';
  document.getElementById('prog-text').textContent = `${total} / ${total}`;
  showScreen('results');
}

function retryQuiz() { startQuiz(state.currentDiff); }
function quitQuiz() { showScreen('difficulty'); }

// Clock
function updateClock() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  document.getElementById('sb-time').textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// Init
buildHome();

// Bind UI buttons (no inline handlers — CSP blocks them)
document.getElementById('back-btn').addEventListener('click', showHome);
document.getElementById('diff-easy').addEventListener('click', () => startQuiz('easy'));
document.getElementById('diff-medium').addEventListener('click', () => startQuiz('medium'));
document.getElementById('diff-hard').addEventListener('click', () => startQuiz('hard'));
document.getElementById('quit-btn').addEventListener('click', quitQuiz);
document.getElementById('next-btn').addEventListener('click', nextQuestion);
document.getElementById('retry-btn').addEventListener('click', retryQuiz);
document.getElementById('change-diff-btn').addEventListener('click', quitQuiz);
document.getElementById('home-btn').addEventListener('click', showHome);
document.getElementById('coal-stare-btn').addEventListener('click', stareAtCoals);
document.getElementById('coal-yes-btn').addEventListener('click', keepStaringAtCoals);
document.getElementById('coal-no-btn').addEventListener('click', returnFromCoals);
document.getElementById('grill-yes-btn').addEventListener('click', grillYes);
document.getElementById('grill-no-btn').addEventListener('click', grillNo);
showScreen('home');
