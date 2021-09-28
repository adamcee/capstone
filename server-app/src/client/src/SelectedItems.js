import PropTypes from "prop-types";

function SelectedItems({ items }) {
  const itemsSelected = items.filter(item => item.checked === true);

  return (
    <ul>
     {itemsSelected.map(item => <li>{item.name}</li>)}
    </ul>
  )

}

SelectedItems.propTypes = {
  items: PropTypes.array.isRequired,
};


export default SelectedItems;