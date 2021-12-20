import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { cx, css } from '@leafygreen-ui/emotion';
import { uiColors } from '@leafygreen-ui/palette';
import { SideNavItem } from '@leafygreen-ui/side-nav';
import Tooltip from '@leafygreen-ui/tooltip';
import Icon from '@leafygreen-ui/icon';
import styled from '@emotion/styled';
import Link from '../Link';
import { theme } from '../../theme/docsTheme';
import { formatText } from '../../utils/format-text';
import { isActiveTocNode } from '../../utils/is-active-toc-node';
import { isSelectedTocNode } from '../../utils/is-selected-toc-node';

const sideNavItemStyling = ({ level }) => css`
  color: ${uiColors.gray.dark3};
  padding-bottom: ${theme.size.small};
  padding-left: calc(${theme.size.small} + (${level} * ${theme.size.default}));
  padding-right: ${theme.size.medium};
  padding-top: ${theme.size.small};
  text-transform: none;
`;

const toolTipStyling = css`
  left: 35px;
`;

// Toctree nodes begin at level 1 (i.e. toctree-l1) for top-level sections and increase
// with recursive depth
const BASE_NODE_LEVEL = 1;

/**
 * Potential leaf node for the Table of Contents. May have children which are also
 * recursively TOCNodes.
 */
const TOCNode = ({ activeSection, handleClick, level = BASE_NODE_LEVEL, node }) => {
  const { title, slug, url, children, options = {} } = node;
  const target = slug || url;
  const hasChildren = !!children.length;
  const isActive = isActiveTocNode(activeSection, slug, children);
  const isSelected = isSelectedTocNode(activeSection, slug);
  const isDrawer = !!(options && options.drawer);
  const isTocIcon = !!options.tocicon;
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(isActive);

  // If the active state of this node changes, change the open state to reflect it
  // Disable linter to handle conditional dependency that allows drawers to close when a new page is loaded
  useEffect(() => {
    setIsOpen(isActive);
  }, [isActive, isDrawer ? activeSection : null]); // eslint-disable-line react-hooks/exhaustive-deps

  const NodeLink = () => {
    // If title is a plaintext string, render as-is. Otherwise, iterate over the text nodes to properly format titles.
    const formatTextOptions = {
      literalEnableInline: true,
    };
    // Wrap title in a div to prevent SideNavItem from awkwardly spacing titles with nested elements (e.g. code tags)
    const formattedTitle = <div>{formatText(title, formatTextOptions)}</div>;

    if (isTocIcon && isDrawer && hasChildren) {
      return (
        <SideNavItem
          className={cx(sideNavItemStyling({ level }))}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <SyncCloud onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Icon glyph="Cloud" fill="#000000" />
            <Tooltip
              usePortal={true}
              className={cx(toolTipStyling)}
              portalClassName={cx(toolTipStyling)}
              triggerEvent="hover"
              align="top"
              justify="middle"
              darkMode={true}
              open={isHovered}
              popoverZIndex={2}
            >
              This involves Realm App Services.
              <br></br>
              You will need an Atlas account.
            </Tooltip>
          </SyncCloud>
          {formattedTitle}
        </SideNavItem>
      );
    } else if (isDrawer && hasChildren) {
      return (
        <SideNavItem
          className={cx(sideNavItemStyling({ level }))}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          {formattedTitle}
        </SideNavItem>
      );
    } else if (isTocIcon) {
      return (
        <SideNavItem
          as={Link}
          to={target}
          active={isSelected}
          className={cx(sideNavItemStyling({ level }))}
          onClick={handleClick}
        >
          <SyncCloud onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Icon glyph="Cloud" fill="#000000" />
            <Tooltip
              usePortal={true}
              className={cx(toolTipStyling)}
              portalClassName={cx(toolTipStyling)}
              triggerEvent="hover"
              align="top"
              justify="middle"
              darkMode={true}
              open={isHovered}
              popoverZIndex={2}
            >
              This involves Realm App Services.
              <br></br>
              You will need an Atlas account.
            </Tooltip>
          </SyncCloud>
          {formattedTitle}
        </SideNavItem>
      );
    }
    return (
      <SideNavItem
        as={Link}
        to={target}
        active={isSelected}
        className={cx(sideNavItemStyling({ level }))}
        onClick={handleClick}
      >
        {formattedTitle}
      </SideNavItem>
    );
  };

  return (
    <>
      <NodeLink />
      {isOpen &&
        children.map((c) => {
          const key = c.slug || c.url;
          return (
            <TOCNode activeSection={activeSection} handleClick={handleClick} node={c} level={level + 1} key={key} />
          );
        })}
    </>
  );
};

const SyncCloud = styled.div`
  padding-right: 10px;
  margin-top: 5px;
`;

TOCNode.propTypes = {
  level: PropTypes.number,
  node: PropTypes.shape({
    children: PropTypes.array.isRequired,
    options: PropTypes.shape({
      drawer: PropTypes.bool,
      tocicon: PropTypes.bool,
      styles: PropTypes.objectOf(PropTypes.string),
    }),
    slug: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.string]).isRequired,
    url: PropTypes.string,
  }).isRequired,
};

TOCNode.defaultProps = {
  level: BASE_NODE_LEVEL,
};

export default TOCNode;
