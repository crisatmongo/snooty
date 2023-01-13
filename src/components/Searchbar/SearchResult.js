import React, { useCallback, useContext, useRef } from 'react';
import sanitizeHtml from 'sanitize-html';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { palette } from '@leafygreen-ui/palette';
import { Body } from '@leafygreen-ui/typography';
import { theme } from '../../theme/docsTheme';
import { getNestedValue } from '../../utils/get-nested-value';
import Tag, { searchTagStyle } from '../Tag';
import SearchContext from './SearchContext';
import { StyledTextInput } from './SearchTextInput';

const ARROW_DOWN_KEY = 40;
const ARROW_UP_KEY = 38;
const LINK_COLOR = '#494747';
// Use string for match styles due to replace/innerHTML
const SEARCH_MATCH_STYLE = `background-color: ${palette.yellow.light2};`;

const largeResultTitle = css`
  font-size: ${theme.size.default};
  line-height: ${theme.size.medium};
  /* Only add bold on larger devices */
  @media ${theme.screenSize.smallAndUp} {
    font-weight: 600;
  }
`;

// Truncates text to a maximum number of lines
const truncate = (maxLines) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${maxLines}; /* supported cross browser */
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MobileFooterContainer = styled('div')`
  align-items: flex-end;
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const LearnMoreLink = styled('a')`
  font-size: ${theme.fontSize.small};
  letter-spacing: 0.5px;
  line-height: ${theme.size.default};
`;

const SearchResultContainer = styled('div')`
  height: 100%;
  @media ${theme.screenSize.upToSmall} {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  position: relative;
`;

const SearchResultLink = styled('a')`
  color: ${LINK_COLOR};
  height: 100%;
  text-decoration: none;
  border-radius: ${theme.size.medium};
  :hover,
  :focus {
    color: ${LINK_COLOR};
    text-decoration: none;
    ${SearchResultContainer} {
      background-color: rgba(231, 238, 236, 0.4);
      transition: background-color 150ms ease-in;
    }
  }
`;

const StyledPreviewText = styled(Body)`
  font-size: ${theme.fontSize.small};
  line-height: 20px;
  margin-bottom: ${theme.size.default};
  ${({ maxLines }) => truncate(maxLines)};
  // Reserve some space inside of the search result card when there is no preview
  min-height: 20px;
`;

const StyledResultTitle = styled('p')`
  font-family: Akzidenz;
  font-size: ${theme.fontSize.small};
  line-height: ${theme.size.medium};
  letter-spacing: 0.5px;
  height: ${theme.size.medium};
  margin-bottom: ${theme.size.small};
  margin-top: 0;
  ${truncate(1)};
  ${({ useLargeTitle }) => useLargeTitle && largeResultTitle};
  @media ${theme.screenSize.upToSmall} {
    ${largeResultTitle};
  }
`;

const StyledTag = styled(Tag)`
  ${searchTagStyle}
`;

const StylingTagContainer = styled('div')`
  bottom: 0;
  margin-bottom: ${theme.size.medium};
`;

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightSearchTerm = (text, searchTerm) =>
  text.replace(
    new RegExp(escapeRegExp(searchTerm), 'gi'),
    (result) => `<span style="${SEARCH_MATCH_STYLE}">${result}</span>`
  );

// since we are using dangerouslySetInnerHTML, this helper sanitizes input to be safe
const sanitizePreviewHtml = (text) =>
  sanitizeHtml(text, {
    allowedTags: ['span'],
    allowedAttributes: { span: ['style'] },
    allowedStyles: { span: { 'background-color': [new RegExp(`^${palette.yellow.light2}$`, 'i')] } },
  });

const SearchResult = React.memo(
  ({
    learnMoreLink = false,
    maxLines = 2,
    useLargeTitle = false,
    onClick,
    preview,
    title,
    searchProperty,
    url,
    ...props
  }) => {
    const { searchContainerRef, searchPropertyMapping, searchTerm } = useContext(SearchContext);
    const highlightedTitle = highlightSearchTerm(title, searchTerm);
    const highlightedPreviewText = highlightSearchTerm(preview, searchTerm);
    const resultLinkRef = useRef(null);
    const category = searchPropertyMapping?.[searchProperty]?.['categoryTitle'];
    const version = searchPropertyMapping?.[searchProperty]?.['versionSelectorLabel'];

    const onArrowDown = useCallback(
      (resultLinkRef) => {
        const nextSibling = getNestedValue(['current', 'nextSibling'], resultLinkRef);
        if (nextSibling) {
          nextSibling.focus();
        } else {
          // This is the last result, so let's loop back to the top
          if (searchContainerRef && searchContainerRef.current) {
            const firstLink = searchContainerRef.current.querySelector(`${SearchResultLink}`);
            if (firstLink) {
              firstLink.focus();
            }
          }
        }
      },
      [searchContainerRef]
    );

    const onArrowUp = (resultLinkRef) => {
      const prevSibling = getNestedValue(['current', 'previousSibling'], resultLinkRef);
      if (prevSibling) {
        // If these don't match, we have gone up out of the results
        if (prevSibling.nodeName !== resultLinkRef.current.nodeName) {
          // This is the first result, so let's go to the search bar
          document.querySelector(`${StyledTextInput} input`).focus();
        } else {
          prevSibling.focus();
        }
      }
    };
    // Navigate with arrow keys
    const onKeyDown = useCallback(
      (e) => {
        // Only allow arrow keys if we are within the searchbar (not if this is being reused)
        if (searchContainerRef) {
          if (e.key === 'ArrowDown' || e.keyCode === ARROW_DOWN_KEY) {
            e.preventDefault();
            // find next result and focus
            onArrowDown(resultLinkRef);
          } else if (e.key === 'ArrowUp' || e.keyCode === ARROW_UP_KEY) {
            e.preventDefault();
            // find previous result and focus
            onArrowUp(resultLinkRef);
          }
        }
      },
      [onArrowDown, searchContainerRef]
    );

    return (
      <SearchResultLink ref={resultLinkRef} href={url} onClick={onClick} onKeyDown={onKeyDown} {...props}>
        <SearchResultContainer>
          <StyledResultTitle
            dangerouslySetInnerHTML={{
              __html: sanitizePreviewHtml(highlightedTitle),
            }}
            useLargeTitle={useLargeTitle}
          />
          <StyledPreviewText
            maxLines={maxLines}
            dangerouslySetInnerHTML={{
              __html: sanitizePreviewHtml(highlightedPreviewText),
            }}
          />
          <StylingTagContainer>
            {!!category && <StyledTag variant="green">{category}</StyledTag>}
            {!!version && <StyledTag variant="blue">{version}</StyledTag>}
            {url.includes('/api/') && <StyledTag variant="purple">{'API'}</StyledTag>}
          </StylingTagContainer>
          {learnMoreLink && (
            <MobileFooterContainer>
              <LearnMoreLink href={url}>
                <strong>Learn More</strong>
              </LearnMoreLink>
            </MobileFooterContainer>
          )}
        </SearchResultContainer>
      </SearchResultLink>
    );
  }
);

export { SearchResultLink };
export default SearchResult;
