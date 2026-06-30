import { gql } from '@apollo/client';

export default gql`
  mutation Mutation($lang: String!) {
    updateLanguage(lang: $lang) {
      language
    }
  }
`;
