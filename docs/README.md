# 🇮🇳 Bharat-Setu: The Multilingual AI Scheme Navigator

![Shortlisted - Top Innovator](https://img.shields.io/badge/AI%20for%20Bharat%20Hackathon-Shortlisted--Top%20Innovator-FF9933?style=for-the-badge&logo=google-cloud&logoColor=white)

**Bharat-Setu** is a "Digital Sarpanch"—a voice-native AI Agent built to bridge the information gap for India's 70% rural population. By leveraging **Agentic RAG**, it transforms complex government policy documents into conversational guidance in 10+ Indic dialects.

## 🚀 Key Features

- **Dialect-Native Voice Interface**: Real-time Speech-to-Text and Text-to-Speech supporting Hindi, Tamil, Marathi, and more using **Amazon Transcribe** and **Polly**.
- **Agentic RAG Pipeline**: Unlike basic keyword search, our agent reasons across official guidelines to match users based on age, income, and occupation.
- **Personalized Scheme Matching**: Provides real-time eligibility analysis and a simplified document checklist for applications.
- **Responsible AI**: Integrated with **Bedrock Guardrails** to ensure 100% factual accuracy and zero hallucinations.
- **Offline Fallback**: Designed for rural accessibility via SMS integration for low-network areas.

## 🛠️ Technical Stack

- **Core AI**: **Anthropic Claude 3** via **Amazon Bedrock**.
- **Orchestration**: **Bedrock Agents** for intent extraction and task decomposition.
- **Vector Database**: **Amazon OpenSearch Serverless** for high-performance RAG.
- **Compute**: **AWS Lambda** (Serverless Architecture).
- **Storage**: **Amazon S3** for policy documents and **Amazon DynamoDB** for user profiles.

## 🏗️ Architecture

The system follows a production-grade serverless workflow:

1. **Voice Input**: User speaks in their local dialect.
2. **Processing**: **Amazon Transcribe** converts speech to text for intent extraction.
3. **Reasoning**: **Bedrock Agent** queries the **OpenSearch** knowledge base.
4. **Verification**: **Claude 3** matches eligibility and generates a grounded response.
5. **Output**: **Amazon Polly** delivers conversational guidance back to the user.

## 💻 Development Workflow

This project is developed using the **Antigravity IDE**, an agent-first development platform.

- **Agent Autonomy**: We use autonomous agents to manage backend logic and frontend styling in parallel.
- **Verification**: Agents run integrated tests within the Antigravity browser to ensure UI responsiveness across devices.

## ⚙️ Installation & Setup

> [!NOTE]
> This project requires an AWS account with access to Amazon Bedrock (Claude 3 models), Amazon OpenSearch Serverless, and IAM permissions for Lambda/S3.

### Prerequisites

- **AWS CLI** configured with appropriate credentials.
- **Node.js 18+** (for frontend/CDK) or **Python 3.10+** (for Lambda logic).
- **Terraform** or **AWS CDK** for infrastructure deployment.

### Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/madhavmadupu/bharat-setu.git
   cd bharat-setu
   ```

2. **Infrastructure Deployment:**

   ```bash
   # Using AWS CDK
   npm install
   npx cdk deploy
   ```

3. **Backend Configuration:**
   - Upload policy documents (PDFs) to the designated S3 bucket.
   - Trigger the Bedrock Agent sync to update the OpenSearch knowledge base.

4. **Environment Variables:**
   Create a `.env` file in the root directory:

   ```env
   AWS_REGION=us-east-1
   BEDROCK_AGENT_ID=your_agent_id
   OPENSEARCH_ENDPOINT=your_endpoint
   ```

5. **Run Locally:**
   ```bash
   npm run dev
   ```

## 📚 Documentation

For detailed documentation, see:

- [Setup Guide](./SETUP.md) - Complete setup and configuration instructions
- [Architecture](./architecture/README.md) - System architecture and design decisions
- [API Reference](./api/README.md) - API endpoints and usage
- [Specifications](./specs/README.md) - Feature specifications and requirements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

_Developed with ❤️ for the AI for Bharat Hackathon using Antigravity IDE._
