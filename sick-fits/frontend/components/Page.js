import styled, { ThemeProvider, injectGlobal } from 'styled-components';
import Header from './Header';
import Meta from './Meta';

const theme = {
  red: '#FF0000',
  black: '#393939',
  grey: '#3A3A3A',
  lightgrey: '#E1E1E1',
  offWhite: '#EDEDED',
  maxWidth: '1000px',
  bs: '0 12px 24px 0 rgba(0, 0, 0, 0.09)',
};

const StyledPage = styled.div`
  background: white;
  color: ${props => props.theme.black};
`;

const Inner = styled.div`
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
  padding: 2rem;
`;

const MyButton = styled.button`
  background: red;
  font-size: ${props => (props.huge ? '30px': '10px')};
  span {
    font-size: 20px;
  }
`;

const Page = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <StyledPage>
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
        <Inner>{props.children}</Inner>
      </StyledPage>
    </ThemeProvider>
  );
};

export default Page;