import OrderList from '../components/OrderList';
import PleaseSignin from '../components/PleaseSignin';

const Orders = (props) => (
  <div>
    <PleaseSignin>
      <OrderList />
    </PleaseSignin>
  </div>
);

export default Orders;