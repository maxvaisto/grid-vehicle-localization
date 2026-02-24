
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

from backend.calculator import Calculator, Colors

app = FastAPI()

calculator = Calculator(board_size=5, sensor_accuracy=0.999, num_colors=4)


class RestartRequest(BaseModel):
    num_colors: int
    board_size: int


@app.get("/vehicle_position")
def get_vehicle_position():
    vehicle_position = calculator.vehicle_position.tolist()
    return {"vehicle_position": {"x": vehicle_position[0], "y": vehicle_position[1]}}

@app.get("/get_board")
def get_board():
    return {"board": calculator.game_board.tolist()}

@app.get("/get_probability")
def get_probability():
    return {"probability_field": calculator.prob_field.tolist()}


@app.post("/move")
def move():
    calculator.random_move()


@app.post("/restart")
def restart(request: RestartRequest):
    if not (4 <= request.num_colors <= 8):
        raise HTTPException(status_code=422, detail="num_colors must be between 4 and 8")
    calculator.restart(request.num_colors)

@app.get("/get_colormap")
def get_colormap():
    active_colors = list(Colors)[:calculator.num_colors]
    return {"colormap": {i: {"name": c.name, "RGB": c.value} for i, c in enumerate(active_colors)}}

if __name__ == "__main__":
    uvicorn.run("backend.api:app", host="0.0.0.0", port=8000, reload=True)