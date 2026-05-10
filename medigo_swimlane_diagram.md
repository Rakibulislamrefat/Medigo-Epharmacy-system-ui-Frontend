# Medigo E-Pharmacy System Diagrams

Based on the project structure and features, here are two diagrams that illustrate the system's workflows: a Cross-Functional Swimlane Diagram (showing responsibilities) and a Sequence Diagram (showing the interaction over time).

## 1. Cross-Functional Flowchart (Swimlane Diagram)

This diagram shows the responsibilities of each actor (Customer, System, Doctor, Admin) grouped into swimlanes.

```mermaid
flowchart TD
    subgraph Customer [Customer Swimlane]
        C1(Register / Login)
        C2{Choose Action}
        C3(Browse Medicines & Special Offers)
        C4(Request Doctor Consultation)
        C5(Upload Prescription)
        C6(Place Order / Checkout)
        C7(Track Order Status)
    end

    subgraph Doctor [Doctor Swimlane]
        D1(Receive Consultation Request)
        D2(Provide Consultancy)
        D3(Generate E-Prescription)
    end

    subgraph System [System / App Swimlane]
        S1(Authenticate)
        S2(Retrieve Data)
        S3(Process Request)
        S4(Update Database & Notify)
    end

    subgraph Admin [Admin Swimlane]
        A0(Manage Medicines, Users, Doctors)
        A1(Review Pending Orders & Prescriptions)
        A2{Validate Order?}
        A3(Approve & Update Status)
        A4(Reject Order)
    end

    %% Customer to System
    C1 --> S1
    S1 --> C2
    C2 --> C3
    C2 --> C4
    C2 --> C5
    
    %% Browsing flow
    C3 --> S2
    S2 --> C6
    
    %% Consultation flow
    C4 --> S3
    S3 --> D1
    D1 --> D2
    D2 --> D3
    D3 --> C5
    
    %% Ordering flow
    C5 --> S3
    C6 --> S3
    S3 --> A1
    
    %% Admin flow
    A0 -.-> S4
    A1 --> A2
    A2 -- Yes --> A3
    A2 -- No --> A4
    A3 --> S4
    A4 --> S4
    
    %% Notification to Customer
    S4 --> C7
```

## 2. Main Process Sequence Diagram

This diagram visualizes the timeline of actions and interactions between the different actors during the core "Order & Consultation" process.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant System as Medigo Platform
    actor Doctor
    actor Admin

    Customer->>System: Register / Login
    System-->>Customer: Authentication Success

    alt Buy Medicine Directly
        Customer->>System: Browse Medicines & Offers
        System-->>Customer: Return Medicine List
        Customer->>System: Add to Cart & Checkout
    else Need Consultation
        Customer->>System: Request Doctor Consultancy
        System->>Doctor: Route Request to Available Doctor
        Doctor-->>System: Provide Consultation
        Doctor-->>System: Generate E-Prescription
        System-->>Customer: Send E-Prescription
        Customer->>System: Upload Prescription & Checkout
    else Already Has Prescription
        Customer->>System: Upload Prescription & Checkout
    end

    System->>Admin: New Order Notification (with Prescription if any)
    
    Admin->>System: Review Order & Prescription
    alt Invalid / Out of Stock
        Admin->>System: Reject Order
        System-->>Customer: Notification: Order Cancelled / Issue
    else Valid & Stock Available
        Admin->>System: Approve Order (Status: Processing)
        System-->>Customer: Notification: Order Approved
        Admin->>System: Dispatch Order (Status: Shipped/Delivered)
        System-->>Customer: Notification: Order Delivered
    end
    
    Customer->>System: Leave Review / Feedback
```
