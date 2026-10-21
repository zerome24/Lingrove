from fastapi import APIRouter, HTTPException
from backend.app.schemas import CostCalculatorInput, CostCalculatorResult

router = APIRouter(prefix="/api/calculator", tags=["Cost Calculator"])

@router.post("", response_model=CostCalculatorResult)
def calculate_bamboo_product_cost(data: CostCalculatorInput):
    if data.desired_margin_percentage < 0 or data.desired_margin_percentage >= 100:
        raise HTTPException(
            status_code=400,
            detail="Desired margin percentage must be between 0% and less than 100%"
        )

    total_cost = (
        data.material_cost +
        data.labor_cost +
        data.finishing_cost +
        data.packaging_cost +
        data.transport_cost +
        data.other_expenses
    )

    if total_cost <= 0:
        raise HTTPException(
            status_code=400,
            detail="Total production expenses must be greater than zero."
        )

    # Selling Price = Total Cost / (1 - Margin Percentage / 100)
    margin_factor = 1.0 - (data.desired_margin_percentage / 100.0)
    suggested_selling_price = round(total_cost / margin_factor, 2)
    estimated_profit = round(suggested_selling_price - total_cost, 2)

    return {
        "total_cost": round(total_cost, 2),
        "desired_margin_percentage": data.desired_margin_percentage,
        "suggested_selling_price": suggested_selling_price,
        "estimated_profit": estimated_profit,
        "disclaimer": "This calculated value is an indicative estimate based on your provided cost parameters, not a verified market price."
    }
