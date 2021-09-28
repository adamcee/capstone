import PropTypes from "prop-types";

// src imports
import Item from "./Item";

function ItemsList({ items, type, updateItem }) {
  console.log(items);
  console.log(type);

  const filteredItems = items.filter((item) => item.type === type);
  console.log(filteredItems);

  return (
    <div>
      {type} List
      <ul>
        {filteredItems.map((item, index) => (
          <div key={type + "-" + index}>
            <Item item={item} updateItem={updateItem} />
          </div>
        ))}
      </ul>
    </div>
  );
}

ItemsList.propTypes = {
  items: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  updateItem: PropTypes.func.isRequired,
};

export default ItemsList;
