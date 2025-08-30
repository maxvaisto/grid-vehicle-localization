
from fastapi import FastAPI
import uvicorn

from backend.calculator import Calculator, Colors

app = FastAPI()

calculator = Calculator(board_size=5, sensor_accuracy=0.999)


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

@app.get("/get_colormap")
def get_colormap():
    return {"colormap": {i: {"name": c.name, "RGB": c.value} for i, c in enumerate(Colors)}}

if __name__ == "__main__":
    uvicorn.run("backend.api:app", host="0.0.0.0", port=8000, reload=True)