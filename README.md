# 📄 Document Signature App

A secure, full-stack enterprise document management and digital signing solution. This application allows users to upload PDF documents, place digital signatures (hand-drawn or typed) using an interactive drag-and-drop interface, and download the permanently signed documents.

---

## 🚀 Key Features
- **Secure Signing**: Supports both handwritten signatures via canvas and professional typed signatures.
- **Interactive UX**: Drag-and-drop signature placement using `dnd-kit` for precise document signing.
- **PDF Manipulation**: Uses `pdf-lib` for binary-safe, permanent signature embedding directly into the PDF structure.
- **Authentication**: Secure JWT-based authentication for user-specific document storage.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **PDF Rendering**: `react-pdf`
- **Interactive UI**: `dnd-kit`, `react-signature-canvas`

### Backend
- **API**: FastAPI (Python)
- **PDF Processing**: `pdf-lib`
- **Database**: PostgreSQL 
- **Deployment**: Vercel (Frontend), Railway (Backend)

---

## 📈 Development Roadmap
This project was built over a rigorous 14-day cycle, ensuring modularity and scalability:

| Phase | Days | Focus |
| :--- | :--- | :--- |
| **Foundation** | 1-3 | Architecture, Auth system, & DB setup. |
| **Integration**| 4-7 | PDF rendering, Document API, & Frontend integration. |
| **Core Logic** | 8-11 | Signature coordinate mapping, binary PDF processing, & flow states. |
| **Polish** | 12-14 | Audit trails, UI/UX optimization, and deployment. |

---

## 💻 How to Run

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL Database

