import random
from datetime import datetime, timedelta
import math

def round_to_nearest(value, base=5):
    return base * round(value / base)

def generate_realistic_progress(
    start_days_ago=180,
    min_step=18,
    max_step=45,
    y_intercept=95,    # starting bench PR
    max_increment=10,   # smaller initial jumps
    min_increment=0.5, # minimal increment for later
    round_base=5
):
    """
    Generates a monotonically increasing series that stops at today,
    with slower growth for realistic bench press progress (~95 → ~170 in 120 days)
    """
    current_date = datetime.now() - timedelta(days=start_days_ago)
    end_date = datetime.now()
    data = []

    prev_y = y_intercept
    i = 0

    while current_date < end_date:
        # Random step in days
        step = random.randint(min_step, max_step)
        next_date = current_date + timedelta(days=step)
        if next_date > end_date:
            next_date = end_date

        # Non-linear decay factor (slower early growth)
        decay_factor = math.sqrt(1 - (i / (i + 20)))  # smoother, slower decay

        # Smaller increments for realistic growth
        increment = random.uniform(min_increment, max_increment * decay_factor)

        # Ensure always increasing
        y_value = prev_y + max(increment, 0.5)  # always allow small growth
        y_value = round_to_nearest(y_value, round_base)

        if y_value <= prev_y:
            y_value = prev_y + round_base

        prev_y = y_value
        current_date = next_date
        data.append({
            "x": current_date.strftime("%Y-%m-%d"),
            "y": y_value
        })

        i += 1

        # Safety check
        if len(data) > 1000:
            break

    return data


# Example usage
if __name__ == "__main__":
    starting_pr = 130
    points = generate_realistic_progress(start_days_ago=120, y_intercept=starting_pr)
    print(points)
