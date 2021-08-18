import React, { useState, useEffect } from 'react';
import { theme } from '../../../../theme/docsTheme';
import { css, cx } from '@leafygreen-ui/emotion';
import { useFeedbackState } from '../context';
import styled from '@emotion/styled';

const SentimentEmoji = styled('span')`
  padding-right: ${theme.size.small};
  font-size: 22px !important;
`;

const CommentWrapper = styled('div')`
  cursor: pointer;
  margin: 10px 16px !important;
  text-align: center;
`;

const CommentEmojiChar = styled('p')`
  font-size: ${theme.size.medium} !important;
  margin: 0px !important;
  ${(props) => !props.isActive && `opacity: 0.5`};
`;

const CommentCopy = styled('p')`
  ${(props) => !props.isActive && `display: none`};
  margin: 0px !important;
`;

const getEmojiInfo = (sentiment) => {
  switch (sentiment) {
    case 'happy':
      return { character: '🙂', copy: 'Helpful' };
    case 'upset':
      return { character: '😞', copy: 'Unhelpful' };
    case 'suggesting':
      return { character: '💡', copy: 'Idea' };
    default:
      return undefined;
  }
};

const CommentEmoji = ({ isActive, sentiment, setActiveSentiment }) => {
  const { character, copy } = getEmojiInfo(sentiment);
  return (
    <div>
      <CommentWrapper isActive={isActive} onClick={() => setActiveSentiment(sentiment)}>
        <CommentEmojiChar isActive={isActive}>{character}</CommentEmojiChar>
        <CommentCopy isActive={isActive}>{copy}</CommentCopy>
      </CommentWrapper>
    </div>
  );
};

const emojiFactory = ({ sentiment, currPage, isActive, setActiveSentiment }) => {
  switch (currPage) {
    case 'sentimentView':
      return <SentimentEmoji>{getEmojiInfo(sentiment).character}</SentimentEmoji>;
    case 'commentView':
      return <CommentEmoji isActive={isActive} sentiment={sentiment} setActiveSentiment={setActiveSentiment} />;
  }
};

const Emoji = ({ sentiment, currPage }) => {
  const { activeSentiment, setActiveSentiment } = useFeedbackState();
  const [isActive, setIsActive] = useState();
  useEffect(() => {
    setIsActive(activeSentiment == sentiment);
  }, [activeSentiment, sentiment]);
  const emoji = emojiFactory({ sentiment, currPage, isActive, setActiveSentiment });
  return emoji;
};

export default Emoji;
