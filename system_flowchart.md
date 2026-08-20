# HOA & Barangay Portal — System Flowchart

![HOA & Barangay Portal System Flowchart](C:/Users/Wayne/.gemini/antigravity-ide/brain/29cf1b2e-9b6d-4b48-ad8c-0d803039e971/hoa_system_flowchart_strict_yes_no_1785892096437.png)

### Applied Flowchart Standards & Rules:
1. **Strict Decision Rule (Yes/No Only)**:
   - All Decision Diamonds (`Credentials Valid?`, `Tenant Action Needed?`, `Action Needed?`, `Visitor Entry?`, `Emergency?`, `Payment Due?`, `Request Complete?`) strictly have **only two outgoing branches: `Yes` (green) and `No` (red)**.
   - Multi-way branching is handled by the **`Determine / Select User Role` Process Rectangle**, which routes the user into their respective role dashboard.
2. **Single Start & Single End**:
   - Starts at **1 `START`** oval at top center.
   - All 4 role columns converge at the bottom into a single horizontal bar leading to **1 `Logout`** process and **1 `END`** oval.
3. **Standard Symbol Usage**:
   - ⭕ **Oval**: `START` and `END` only.
   - ▱ **Parallelogram**: Inputs & Outputs (`Display Error Message`, `View All HOAs/Tenants`, `View System Stats`, `View All Users`, `View Financial Reports`, `Notify Residents`, `Track Request Status`, `View Emergency Alerts`).
   - ▭ **Rectangle**: Processes (`LOGIN`, `Determine / Select User Role`, `Open Dashboard`, `Create/Edit/Deactivate`, `Manage Billing`, `Approve/Reject Document`, `Log Visitor`, `Submit Payment`, `Logout`).
   - ♢ **Diamond**: Binary Decisions (`Yes` / `No` conditions).
4. **Zero Dead Ends**:
   - Every `No` branch either bypasses to the subsequent process step or loops back to revise/retry input.
