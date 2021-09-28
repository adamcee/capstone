import PropTypes from "prop-types";

function Item({ item, updateItem }) {
  const handleChange = () => updateItem(item.name);

  return (
    <div>
      <input
        type="checkbox"
        checked={item.checked}
        id={item.name}
        name={item.name}
        onChange={handleChange}
      />
      <label for={item.name}>{item.name}</label>
    </div>
  );
}

Item.propTypes = {
  item: PropTypes.object.isRequired,
  updateItem: PropTypes.func.isRequired,
};

export default Item;
