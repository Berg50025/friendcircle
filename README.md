# FriendCircle - 隐私朋友圈（FHEVM）

一个基于 FHEVM 的隐私保护朋友圈 DApp。支持：
- 发帖（文本 + 可选 IPFS 哈希）
- 点赞（加密输入，保护隐私）
- 打赏（原生代币）
- 解密统计（点赞数、打赏总额），需获得帖子作者授权

本仓库包含：
- 智能合约（Hardhat）
- 部署与 ABI/地址生成脚本
- 前端（Next.js 15 + React 19 + Ethers v6）

---

## 目录结构速览

- `contracts/` 智能合约源码（`FriendCircle.sol`）
- `deploy/deploy.ts` Hardhat-Deploy 脚本
- `deployments/` 部署产物（会在部署后生成/更新）
- `scripts/` 生成 ABI 与地址脚本（供前端使用）
- `frontend/` 前端应用（Next.js）
- `artifacts/`、`types/` Hardhat 编译产物与 TypeChain 类型

---

## 环境要求

- Node.js 18+（建议 20+）
- npm 9+
- 本地链（Hardhat Node）或测试网（Sepolia via Infura）
- 浏览器钱包（MetaMask 等）

可选：
- 若使用 Sepolia，需要配置 `INFURA_API_KEY`、`MNEMONIC`、`ETHERSCAN_API_KEY`（用于验证可选）

---

## 快速开始（本地 Hardhat 网络）

1) 安装依赖（根目录）：

```bash
npm install
```

2) 启动本地节点（新终端）：

```bash
npm run node
```

- 默认 RPC: `http://localhost:8545`
- Chain ID: `31337`

3) 编译与部署合约（新终端或原终端）：

```bash
npm run compile
npm run deploy
```

- 部署完成后会生成/更新 `deployments/localhost/FriendCircle.json`
- 部署脚本会在本地网络将点赞手续费 `likeFeeWei` 设为 0（`deploy/deploy.ts`）

4) 生成前端 ABI 与地址文件（根目录）：

```bash
npm run genabi
```

- 将读取 `artifacts/` 与 `deployments/`，生成：
  - `frontend/src/abi/FriendCircleABI.ts`
  - `frontend/src/abi/FriendCircleAddresses.ts`

5) 启动前端：

```bash
cd frontend
npm install
npm run dev
```

- 开发服务器默认监听 `http://localhost:3000`
- 前端会通过 `window.ethereum` 连接钱包；本地链下 FHEVM 会自动走 Mock（`useFhevm` 指定 `{31337: "http://localhost:8545"}`）

6) 在前端使用：
- 连接钱包（页面右上角「连接钱包」）
- 发布动态：输入文本与可选 IPFS 哈希，提交交易
- 点赞：输入动态 ID，支付点赞手续费（本地为 0）
- 打赏：输入动态 ID 与金额（wei）
- 解密统计：
  - 首次需要点击「申请解密权限」，等待交易确认
  - 再点击「解密统计」按钮，展示点赞数与打赏总额

---

## 连接测试网（Sepolia）

1) 配置变量（Hardhat 使用 `hardhat vars` 或环境变量）：

- MNEMONIC（部署私钥助记词）
- INFURA_API_KEY（访问 RPC）
- ETHERSCAN_API_KEY（可选，用于验证）

示例（仅演示，勿直接使用默认值）：
```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

2) 编译与部署：
```bash
npm run compile
npx hardhat deploy --network sepolia --tags FriendCircle
```

- 部署产物：`deployments/sepolia/FriendCircle.json`
- 部署脚本中 `likeFeeWei` 将被设置为 `0.0001 ETH`（`deploy/deploy.ts`）

3) 生成前端 ABI 与地址：
```bash
npm run genabi
```

- 会同步 `frontend/src/abi/FriendCircleAddresses.ts`，其中包含 `11155111`（Sepolia）与 `31337`（本地）的地址条目

4) 启动前端：
```bash
cd frontend
npm install
npm run dev
```

- 在钱包中切换到 Sepolia，前端将自动匹配 `FriendCircleAddresses` 中的地址
- FHEVM 在非本地链时会加载 Relayer SDK（CDN：`https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs`）

---

## 关键脚本与命令

- 根目录：
  - `npm run node`：启动 Hardhat 本地链
  - `npm run compile`：编译合约
  - `npm run deploy`：部署到 `localhost` 网络（使用 hardhat-deploy）
  - `npm run genabi`：生成前端 ABI 与地址文件
- 前端：
  - `npm run dev`：生成前端 ABI 与地址（若已存在则跳过）并启动 Next.js 开发服务器

---

## FHEVM 说明（前端）

- 本地链（31337）：
  - `frontend/src/fhevm/internal/fhevm.ts` 会尝试通过 RPC `web3_clientVersion` 识别 Hardhat 节点
  - 若为本地链则切换到 Mock 实例（`fhevmMock.ts`），无需加载 CDN SDK
- 测试网：
  - 通过 `RelayerSDKLoader` 动态加载 FHEVM Relayer SDK（`frontend/src/fhevm/internal/RelayerSDKLoader.ts`）
  - 首次使用会调用 `initSDK()`，随后 `createInstance()`

---

## 常见问题（FAQ）与排错

- 钱包未连接 / 没有账户
  - 在页面右上角点击「连接钱包」
  - 确保浏览器已安装 MetaMask，并授权当前站点

- 前端提示 “Unable to locate deployments/localhost/FriendCircle.json”
  - 先执行根目录 `npm run deploy`，再执行 `npm run genabi` 或进入前端执行 `npm run dev`

- 切换链后前端未刷新地址
  - 页面已监听 `chainChanged` 事件，若未生效可刷新页面

- 解密统计报 “未获解密授权”
  - 先点击「申请解密权限」对指定帖子上链授权，等待交易确认后再解密

- 本地链下 FHEVM 报错
  - 确保本地链为 Hardhat，且使用默认 RPC `http://localhost:8545`
  - 若端口不同，可在 `useFhevm` 中的 `initialMockChains` 补充映射

- Sepolia 下 FHEVM SDK 加载失败
  - 检查网络或 CDN 可达性；可重试或稍后再试

- 点赞手续费（likeFeeWei）是多少？
  - 本地链为 0
  - sepolia 在部署脚本中为 `0.0001 ETH`，可根据需要调整 `deploy/deploy.ts`

---

## 合约交互要点

- `createPost(text, ipfsHash)`：发布动态
- `like(postId, encHandle, inputProof)`：点赞（带加密输入，需付 `likeFeeWei`）
- `tip(postId)`：打赏，`{ value: amountWei }`
- `getPost(id)`、`postCount()`：读取帖子信息
- `getEncryptedLikeCount(id)`、`getEncryptedTipTotal(id)`：返回可解密句柄
- `grantDecryptForPost(id)`：为当前账户申请该帖的解密权限

前端已封装在 `frontend/src/hooks/useFriendCircle.tsx`，可直接调用。

---

## 开发建议

- 若修改合约接口，需：
  1) 重新 `npm run compile`
  2) 重新部署对应网络
  3) 重新 `npm run genabi` 以同步前端 ABI 与地址
- 前端默认使用 `window.ethereum`，如需自定义 RPC，可扩展 `useFhevm` 入参

---

## 许可证

本项目仅供学习与演示用途。
