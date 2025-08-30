# CodeScribe Blogging & Article Platform Backend

This repository contains the backend source code for the CodeScribe platform. It's a scalable, event-driven, and modular application built with Node.js, TypeScript, Express, MongoDB, Kafka, and Redis.

## Quick Start 🚀

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Soumasish2005/CodeScribe
    cd devnovate-blog-platform
    ```

2.  **Create your environment file:**
    ```bash
    cp .env.example .env
    ```
    > **Note:** The default values in `.env.example` are configured to work with Docker Compose out of the box.

3.  **Run the entire stack:**
    ```bash
    docker-compose up --build
    ```
    This command will build the Docker images and start all services: `api`, `worker`, `mongo`, `redis`, `kafka`, `zookeeper`, and `mailhog`.

4.  **Access Local Services:**
    * **API:** `http://localhost:4000`
    * **Swagger Docs:** `http://localhost:4000/api-docs`
    * **Mailhog (Email UI):** `http://localhost:8025`

5.  **Running Tests:**
    ```bash
    # Run tests for all packages
    npm test
    ```

---

## Architectural Overview

The system is split into two main applications (`api` and `worker`) that communicate asynchronously via Kafka. This decouples the user-facing API from heavy database write operations, ensuring low latency and high throughput.

### Request & Event Flow Diagram

```text
[User] -> [API Server (Express)] -> (HTTP 200 OK)
   |                |
   |                +-> [MongoDB Transaction]
   |                      |
   |                      +-> Write to `outbox` collection
   |
[Outbox Relay] polls `outbox` -> [Kafka Producer] -> [Kafka Topic (e.g., interactions.events)]
                                                         |
                                                         v
                                     [Worker (Kafka Consumer)] -> [Batch Processor]
                                                                        |
                                                                        +-> Aggregates data (deduplicates likes, etc.)
                                                                        |
                                                                        +-> [MongoDB] (Bulk update counts)
                                                                        +-> [Redis] (Update trending scores, caches)
