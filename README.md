# INTELLIGENT NETWORK STATUS ANALYSIS SYSTEM USING NMS DATA, INTERACTIVE DASHBOARD, AND LLMS

**Short Description**:
The Intelligent Network Status Analysis System is a prototype platform that ingests telemetry data from a Network Management System (NMS) such as Zabbix, processes and stores it efficiently, and presents meaningful insights through an interactive real-time dashboard.


## Key objectives
- Collect and aggregate network telemetry data from Zabbix (currently batch-processed).
- Store and manage structured and semi-structured NMS data efficiently.
- Transform raw metrics into meaningful KPIs and trends.
- Provide an interactive dashboard for real-time network visibility.
- Integrate LLMs to:
  - Interpret user queries
  - Automate analytics and aggregation pipelines
  - Generate predictive insights and summaries
- Enable network administrators to proactively detect potential downtimes and performance degradation.

## Tech Stack
- Network monitoring & ingestion: **Zabbix**, **FastAPI**
- Storage: **PostgreSQL**, **MongoDB**
- LLM: **gpt-oss-20B**
- Frontend/dashboard: **React** (connects to FastAPI backend)

## Quick Start
1. Clone the repo.
2. Follow folder-specific docs for installation and environment setup.

## Contributors
- Rajat Paliwal (2022BTech081)
- Swastik Kulshreshtha (2022BTech105)
- Utkarsh Tailor (2022BTech106)

Project Supervisor: Dr. Devika Kataria

---
