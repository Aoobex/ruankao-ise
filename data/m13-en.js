window.RK_DATA = window.RK_DATA || {};
window.RK_DATA.modules = (window.RK_DATA.modules || []).concat([
  {
    id: 'en',
    name: '专业英语',
    day: 5,
    weight: 3,
    priority: 'mid',
    intro: '专业英语题量不大但送分明显，背熟高频术语与缩写即可拿到大部分分数。',
    cards: [
      {
        t: 'CIA三性与不可否认',
        b: [
          'Confidentiality 保密性：信息只被授权者访问，对应加密与访问控制。',
          'Integrity 完整性：信息未被未授权篡改，对应哈希、签名与版本控制。',
          'Availability 可用性：授权用户需要时可用，对应冗余、备份与抗DDoS。',
          'Non-repudiation 不可否认性：发送方事后不能否认行为，靠数字签名实现。'
        ],
        tip: 'CIA 是 Confidentiality、Integrity、Availability，不是中央情报局。'
      },
      {
        t: '认证、授权与审计',
        b: [
          'Authentication 认证：验证“你是谁”，手段有口令、令牌、生物特征。',
          'Authorization 授权：决定“你能做什么”，如RBAC角色权限。',
          'Audit 审计：事后检查“你做了什么”，依赖日志与记录。',
          'Accountability 可问责性：每个操作可追溯到具体主体。',
          'SSO 单点登录：一次认证访问多个系统，风险是单点失守。'
        ],
        tip: '先认证后授权，顺序不能反；AAA = Authentication, Authorization, Accounting。'
      },
      {
        t: '密码学术语',
        b: [
          'Plaintext 明文，ciphertext 密文，encryption 加密，decryption 解密。',
          'Cipher 密码算法，key 密钥；算法公开、密钥保密是柯克霍夫原则。',
          'Symmetric 对称加密：加解密同一密钥，速度快，密钥分发难，如AES。',
          'Asymmetric 非对称加密：公钥加密私钥解密，解决分发，速度慢，如RSA。',
          'Hybrid 混合加密：用非对称传对称会话密钥，再用对称加密数据，即TLS做法。'
        ]
      },
      {
        t: '哈希、签名与证书',
        b: [
          'Hash 哈希：单向定长摘要，用于完整性校验与口令存储，不可逆。',
          'Digital signature 数字签名：先哈希再用私钥签名，验证用公钥，提供完整性与不可否认。',
          'Certificate 数字证书：CA签发的公钥与身份绑定，解决公钥真实性问题。',
          'PKI 公钥基础设施：CA、RA、证书库、CRL/OCSP 组成，支撑证书生命周期。',
          'MAC 消息认证码：用共享密钥保证完整性与认证，但不提供不可否认。'
        ],
        tip: '签名用私钥，加密用对方公钥，这两句方向别搞反。'
      },
      {
        t: '网络防护设备与协议',
        b: [
          'Firewall 防火墙：按五元组策略控制流量，分包过滤、状态检测、应用代理。',
          'IDS 入侵检测系统：旁路监听并告警，不阻断流量。',
          'IPS 入侵防御系统：串接在线，可主动丢弃恶意流量。',
          'VPN 虚拟专用网：在公网建立加密隧道，常用IPsec与SSL VPN。',
          'TLS 传输层安全：为HTTP等提供加密与身份认证；DLP 数据防泄漏：识别并阻断敏感数据外传。'
        ],
        tip: 'IDS 只“看”，IPS 能“拦”，字母 P 记成 prevent。'
      },
      {
        t: '威胁与管理术语',
        b: [
          'Vulnerability 脆弱性（漏洞），exploit 利用代码/行为，patch 补丁。',
          'Malware 恶意软件，ransomware 勒索软件，phishing 网络钓鱼，social engineering 社会工程。',
          'Asset 资产，threat 威胁，risk 风险，control 控制措施，compliance 合规。',
          'Incident response 应急响应；forensics 取证；business continuity 业务连续性。',
          'SOC 安全运营中心，SIEM 安全信息与事件管理，用于日志集中关联分析。'
        ],
        tip: '威胁是“谁可能害你”，脆弱性是“你哪里有洞”，风险是两者相遇的后果。'
      }
    ]
  }
]);
window.RK_DATA.questions = (window.RK_DATA.questions || []).concat([
  { id: 'en-01', m: 'en', tag: 'CIA', lv: 1, q: 'The property that ensures information is not disclosed to unauthorized parties is called:', o: ['integrity', 'availability', 'accountability', 'confidentiality'], a: 3, e: 'confidentiality 指信息不被未授权者读取，对应保密性。integrity 是完整性，防篡改；availability 是可用性；accountability 是可问责性，均不表示防泄露。' },
  { id: 'en-02', m: 'en', tag: 'CIA', lv: 1, q: '“完整性”在信息安全专业英语中通常写作：', o: ['availability', 'authenticity', 'integrity', 'reliability'], a: 2, e: 'integrity 指数据未被未授权篡改，即完整性。availability 是可用性，authenticity 是真实性，reliability 是可靠性，含义均不同。' },
  { id: 'en-03', m: 'en', tag: '不可否认', lv: 2, q: 'Digital signatures mainly provide which of the following properties?', o: ['Availability', 'Confidentiality', 'Scalability', 'Non-repudiation'], a: 3, e: '数字签名用私钥签署，发送方事后无法否认，故提供不可否认性，同时保证完整性。它不直接提供可用性、保密性或可扩展性，保密需另行加密。' },
  { id: 'en-04', m: 'en', tag: '认证与授权', lv: 1, q: 'Which term describes the process of deciding what an authenticated user is allowed to do?', o: ['Authentication', 'Authorization', 'Accounting', 'Encryption'], a: 1, e: 'authorization 决定已认证主体能做什么，即授权。authentication 只验证身份，accounting 记录行为，encryption 保护数据机密性。' },
  { id: 'en-05', m: 'en', tag: '审计', lv: 2, q: '“审计日志”中的“审计”对应的英文是：', o: ['inspection', 'monitoring', 'audit', 'assessment'], a: 2, e: 'audit 指对记录进行独立检查以确认合规与追责，审计日志即 audit log。inspection 是检查，monitoring 是监控，assessment 是评估，均非审计的标准译法。' },
  { id: 'en-06', m: 'en', tag: '对称加密', lv: 1, q: 'Which statement about symmetric encryption is correct?', o: ['It uses the same key for encryption and decryption', 'It uses a public key and a private key', 'It cannot be used for bulk data', 'It provides non-repudiation by itself'], a: 0, e: '对称加密加解密使用同一密钥，速度快，适合大量数据。公钥私钥成对是非对称加密；对称加密正适合批量数据；它无法提供不可否认性。' },
  { id: 'en-07', m: 'en', tag: '数字签名', lv: 2, q: 'When creating a digital signature, the signer uses:', o: ['the receiver’s public key', 'the receiver’s private key', 'the signer’s public key', 'the signer’s private key'], a: 3, e: '签名用签名者自己的私钥，验证者用签名者公钥，才能证明身份并防止抵赖。用对方公钥或私钥都无法实现签名，签名者公钥是对外公开用于验证的。' },
  { id: 'en-08', m: 'en', tag: '哈希', lv: 2, q: 'A cryptographic hash function is designed to be:', o: ['reversible with the right key', 'faster than symmetric encryption', 'suitable for key exchange', 'one-way and collision-resistant'], a: 3, e: '哈希函数是单向且抗碰撞的，无法由摘要还原原文。它不是可逆加密，也不用于密钥交换，速度比较不是其设计目标。' },
  { id: 'en-09', m: 'en', tag: 'PKI', lv: 2, q: 'In PKI, a digital certificate is issued by:', o: ['the end user', 'the firewall', 'a Certificate Authority', 'the DNS server'], a: 2, e: '数字证书由证书颁发机构CA签发，把公钥与身份绑定并签名。终端用户自签不被信任，防火墙与DNS服务器不承担签发职责。' },
  { id: 'en-10', m: 'en', tag: '防火墙', lv: 1, q: 'A firewall is primarily used to:', o: ['control network traffic according to security policy', 'encrypt files on the disk', 'detect malware by signature', 'back up database records'], a: 0, e: '防火墙按安全策略对网络流量进行过滤与控制。磁盘加密是加密软件的功能，恶意代码检测属于杀毒或EDR，数据库备份属于备份系统。' },
  { id: 'en-11', m: 'en', tag: 'IDS与IPS', lv: 2, q: 'Compared with an IDS, an IPS can:', o: ['only record packets for later analysis', 'work without any network interface', 'replace the firewall completely', 'drop malicious packets inline'], a: 3, e: 'IPS串接在链路中，可实时丢弃恶意流量；IDS旁路监听只告警不阻断。IPS不能取代防火墙，也需要网络接口。' },
  { id: 'en-12', m: 'en', tag: 'VPN', lv: 2, q: 'A VPN is best described as:', o: ['a physical private cable between two offices', 'an encrypted tunnel over a public network', 'a protocol for assigning IP addresses', 'a tool for compressing web pages'], a: 1, e: 'VPN在公网上建立加密隧道，实现安全远程访问与站点互联。它不是物理专线，分配IP是DHCP，压缩网页是压缩或CDN的功能。' },
  { id: 'en-13', m: 'en', tag: '漏洞与利用', lv: 1, q: 'A weakness in software that can be used to compromise a system is called a:', o: ['patch', 'policy', 'vulnerability', 'baseline'], a: 2, e: 'vulnerability 即脆弱性/漏洞，是可能被威胁利用的缺陷。patch 是修复补丁，policy 是策略，baseline 是基线，都是应对措施而非缺陷本身。' },
  { id: 'en-14', m: 'en', tag: '勒索软件', lv: 1, q: 'Malware that encrypts a victim’s files and demands payment is called:', o: ['ransomware', 'adware', 'a rootkit', 'a keylogger'], a: 0, e: 'ransomware 即勒索软件，加密文件并索要赎金。adware 是广告软件，rootkit 用于隐藏自身，keylogger 记录键盘输入，均不符合描述。' },
  { id: 'en-15', m: 'en', tag: '钓鱼', lv: 1, q: 'An email that pretends to come from a bank and asks the user to confirm a password is an example of:', o: ['a buffer overflow', 'a denial of service', 'a logic bomb', 'phishing'], a: 3, e: '伪造身份骗取凭据属于网络钓鱼 phishing。缓冲区溢出与逻辑炸弹是代码层攻击，拒绝服务是耗尽资源使服务不可用。' },
  { id: 'en-16', m: 'en', tag: '阅读主旨', lv: 2, q: 'An organization protects its information by ensuring three properties. Confidentiality keeps data from being read by unauthorized people. Integrity ensures that data is not changed improperly. Availability guarantees that authorized users can access systems when they need them. A security program that ignores any one of these properties is incomplete. What is the main idea of the passage?', o: ['Encryption is the only way to protect data', 'Information security rests on three complementary properties', 'Availability is more important than confidentiality', 'Unauthorized users should be given limited access'], a: 1, e: '短文分别说明保密性、完整性与可用性，并强调缺一不可，主旨是三者共同构成信息安全。文中未说加密是唯一手段，也未比较三者重要性或建议给未授权者权限。' },
  { id: 'en-17', m: 'en', tag: '阅读细节', lv: 3, q: 'An intrusion detection system (IDS) monitors network traffic and raises an alert when it notices suspicious activity. It does not block the traffic by itself. An intrusion prevention system (IPS), by contrast, sits inline and can drop malicious packets before they reach the target. Many companies deploy both: the IDS provides visibility, and the IPS provides active defense. According to the passage, how does an IPS differ from an IDS?', o: ['It only writes log entries for auditors', 'It works without any signature database', 'It can block malicious traffic inline', 'It replaces the need for a firewall'], a: 2, e: '文中明确IPS串接在线并可丢弃恶意数据包，这是与只告警的IDS的关键区别。文中未说IPS只写日志、无需特征库或可替代防火墙。' },
  { id: 'en-18', m: 'en', tag: '阅读细节', lv: 3, q: 'A risk assessment starts with an inventory of assets. The team then identifies the threats that may affect each asset and the vulnerabilities that a threat could exploit. Finally, it estimates the likelihood and the impact of each scenario and calculates a risk level. Controls are chosen only after this analysis is complete. According to the passage, when are controls selected?', o: ['After likelihood and impact have been estimated', 'Before the assets have been identified', 'While the threats are still unknown', 'As soon as a vulnerability is reported'], a: 0, e: '文末指出控制措施只在完成可能性与影响分析后才选择。资产识别是起点，威胁未知或漏洞刚报告时都尚未完成评估，不符合文中顺序。' }
]);
