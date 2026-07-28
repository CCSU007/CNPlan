# Data Dictionary: Sales Transactions

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `transaction_id` | int64 | No | Unique transaction ID |
| `date` | datetime64 | No | Transaction date |
| `product_category` | object | No | Category of the product |
| `product_name` | object | Yes | Name of the product (missing if unknown) |
| `quantity` | int64 | No | Number of units sold |
| `unit_price` | float64 | No | Price per unit in USD |
| `customer_id` | object | Yes | Anonymized customer ID (missing for walk-ins) |
| `region` | object | No | Sales region (North, South, East, West) |
| `payment_method` | object | No | Credit Card, Debit Card, Cash, PayPal |
