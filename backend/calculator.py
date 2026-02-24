from typing import Dict

from scipy import sparse
import numpy as np
from enum import Enum

class Colors(Enum):
    RED = (255, 0, 0)
    GREEN = (0, 255, 0)
    BLUE = (0, 0, 255)
    YELLOW = (255, 255, 0)
    ORANGE = (255, 128, 0)
    PURPLE = (128, 0, 255)
    CYAN = (0, 255, 255)
    MAGENTA = (255, 0, 255)



class Calculator:

    def __init__(self, board_size: int, sensor_accuracy: float, num_colors: int = 4):
        self.board_size = board_size
        self.sensor_probability = sensor_accuracy
        self.num_colors = num_colors

        # Create board and initialize vehicle
        self._init_game_board(board_size)
        self._init_vehicle()


    def restart(self, num_colors: int | None = None):
        """ Start a new game"""
        if num_colors is not None:
            self.num_colors = num_colors
        self._init_game_board(self.board_size)
        self._init_vehicle()


    def _init_game_board(self, board_size):
        """ Re intialize the board """
        self.game_board = np.random.randint(low=0, high=self.num_colors, size=(board_size, board_size), dtype=np.uint8)
        self.prob_field = np.full(shape=(board_size, board_size), fill_value=1 / (board_size * board_size), dtype=np.float64)


    def _init_vehicle(self):
        self.vehicle_position = np.random.randint(low=0, high=self.board_size, size=2, dtype=np.int64)


    def _update_probabilities(self, observed_color: int):
        """ Update the HMM probabilities of the vehicle existing on any of the points"""

        # Each cell moves uniformly to its valid 4-neighbors (edges have 2–3 neighbors).
        # number of valid neighbors for each cell
        deg = np.full((self.board_size, self.board_size), 4.0)
        deg[0, :] -= 1  # no neighbor above
        deg[-1, :] -= 1  # no neighbor below
        deg[:, 0] -= 1  # no neighbor left
        deg[:, -1] -= 1  # no neighbor right

        new_prob_field = np.zeros_like(self.prob_field)

        # gather from neighbors
        new_prob_field[1:, :] += self.prob_field[:-1, :] / deg[:-1, :]  # moving down
        new_prob_field[:-1, :] += self.prob_field[1:, :] / deg[1:, :]  # moving up
        new_prob_field[:, 1:] += self.prob_field[:, :-1] / deg[:, :-1]  # moving right
        new_prob_field[:, :-1] += self.prob_field[:, 1:] / deg[:, 1:]  # moving left


        ## Measurement model
        # Likelihood of seeing the observed color at each cell
        p_hit = self.sensor_probability + (1 - self.sensor_probability) * (1.0 / self.num_colors)
        p_miss = 1.0 - p_hit
        likelihood = np.where(self.game_board == observed_color, p_hit, p_miss)

        post = new_prob_field * likelihood

        # Normalize posterior
        s = post.sum()
        if s <= 0:
            raise ValueError(f"Value overflow unnormalized posterior sum is {s}")
        post /= s

        self.prob_field = post

    def _move_vehicle_randomly(self):
        direction = np.random.randint(2)

        increase = np.random.choice([-1, 1])
        if 0 <= self.vehicle_position[direction] + increase < self.board_size:
            self.vehicle_position[direction] += increase
        else:
            self.vehicle_position[direction] -= increase


    def random_move(self):
        """ Move the vehicle and update the probabilities based on the color form the vehile sensor"""
        self._move_vehicle_randomly()
        self._set_vehicle_sensor_color()

        observed_color = self.get_vehicle_sensor_color()
        self._update_probabilities(observed_color)

    def _set_vehicle_sensor_color(self) -> None:
        """ Update the color detected by the sensor under the vehicle. Note that the sensor is sometimes wrong and gives
        a random color with a ``self.sensor_probability``% chance."""
        if np.random.rand() < self.sensor_probability:
            self.vehicle_sensor_color = self.game_board[self.vehicle_position[0], self.vehicle_position[1]]
        else:
            print("Random color!!")
            self.vehicle_sensor_color = np.random.randint(self.num_colors)

    def get_vehicle_sensor_color(self) -> np.uint8:
        return self.vehicle_sensor_color


if __name__ == "__main__":

    # Example game
    np.random.seed(42)
    sensor_accuracy = 0.99
    calculator = Calculator(board_size=500, sensor_accuracy=sensor_accuracy)
    for i in range(50000):
        calculator.random_move()
        vehicle_probability = calculator.prob_field[calculator.vehicle_position[0], calculator.vehicle_position[1]]
        print(f"Prob {i} under vehicle: {calculator.prob_field[calculator.vehicle_position[0], calculator.vehicle_position[1]]}")
        if np.max(calculator.prob_field) > 1- (1-sensor_accuracy)*5:
            predicted_vehicle_pos = np.unravel_index(np.argmax(calculator.prob_field), np.array(calculator.prob_field).shape)
            print(f"Very certain of results that vehicle is at position {predicted_vehicle_pos} with prob {calculator.prob_field[predicted_vehicle_pos]}")

            if (predicted_vehicle_pos == calculator.vehicle_position).all():
                print(f"Correct position in {i} iterations")
            else:
                print(f"Incorrect position in {i} iterations")
            break



