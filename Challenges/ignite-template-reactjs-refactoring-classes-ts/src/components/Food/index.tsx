import { useState } from "react"

// Utils
import api from "../../services/api"

// Components
import { Container } from "./styles"

// Styling
import { FiEdit3, FiTrash } from "react-icons/fi"

// Types
import { TFood } from "../../types/TFood"

export interface FoodProps {
  food: TFood
  handleEditFood: (food: TFood) => void
  handleDelete: (id: number) => void
}

export default function Food({
  food,
  handleEditFood,
  handleDelete,
}: FoodProps) {
  const [isAvailable, setIsAvailable] = useState(
    () => food.available
  )

  const toggleAvailable = async () => {
    await api.put(`/foods/${food.id}`, {
      ...food,
      available: !isAvailable,
    })

    setIsAvailable((prev) => !prev)
  }

  const setEditingFood = () => {
    handleEditFood(food)
  }

  return (
    <Container available={isAvailable}>
      <header>
        <img src={food.image} alt={food.name} />
      </header>
      <section className="body">
        <h2>{food.name}</h2>
        <p>{food.description}</p>
        <p className="price">
          R$ <b>{food.price}</b>
        </p>
      </section>
      <section className="footer">
        <div className="icon-container">
          <button
            type="button"
            className="icon"
            onClick={setEditingFood}
            data-testid={`edit-food-${food.id}`}
          >
            <FiEdit3 size={20} />
          </button>

          <button
            type="button"
            className="icon"
            onClick={() => handleDelete(food.id)}
            data-testid={`remove-food-${food.id}`}
          >
            <FiTrash size={20} />
          </button>
        </div>

        <div className="availability-container">
          <p>
            {isAvailable ? "Disponível" : "Indisponível"}
          </p>

          <label
            htmlFor={`available-switch-${food.id}`}
            className="switch"
          >
            <input
              id={`available-switch-${food.id}`}
              type="checkbox"
              checked={isAvailable}
              onChange={toggleAvailable}
              data-testid={`change-status-food-${food.id}`}
            />
            <span className="slider" />
          </label>
        </div>
      </section>
    </Container>
  )
}
