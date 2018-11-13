import styled from 'styled-components';
import Header from './Header';
import Meta from './Meta';

const MyButton = styled.button`
  background: red;
  font-size: ${props => (props.huge ? '30px': '10px')};
  span {
    font-size: 20px;
  }
`;

const Page = (props) => {
  return (
    <div>
      <Meta />
      <Header />
      <MyButton huge>
        Click me
        <span>icon</span>
      </MyButton>
      <MyButton>
        Click me
        <span>icon</span>
      </MyButton>
      {props.children}
    </div>
  );
};

export default Page;