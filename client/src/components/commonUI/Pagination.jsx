import React, { useState, useEffect } from "react";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import PropTypes from "prop-types";
import { useIsMobile } from "hooks/useIsMobile";

const PaginationComponent = ({
  pageIndex,
  totalPages,
  onPageChange,
  maxPageNumbersToShow,
}) => {
  const isMobile = useIsMobile();

  maxPageNumbersToShow = isMobile ? 3 : 10;

  const [inputValue, setInputValue] = useState(pageIndex + 1);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter") {
      if (Number(inputValue) === pageIndex + 1) return;
      const page = parseInt(inputValue, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page - 1);
      } else {
        setInputValue(pageIndex + 1); // Reset on invalid input
      }
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPages = Math.min(maxPageNumbersToShow, totalPages);

    let startPage = pageIndex - Math.floor((maxPages - 1) / 2);
    let endPage = pageIndex + Math.ceil((maxPages - 1) / 2);

    if (startPage < 0) {
      endPage = Math.min(totalPages - 1, endPage + Math.abs(startPage));
      startPage = 0;
    }

    if (endPage >= totalPages) {
      startPage = Math.max(0, startPage - (endPage - totalPages + 1));
      endPage = totalPages - 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i} active={pageIndex === i}>
          <PaginationLink onClick={() => onPageChange(i)}>
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  useEffect(() => {
    setInputValue(pageIndex + 1);
  }, [pageIndex]);

  return (
    <div
      className="d-flex align-items-center gap-2 mb-3 float-end"
      style={{ overflowX: "auto" }}>
      <Pagination
        aria-label="Page navigation"
        className="pagination pagination-rounded mb-0">
        <PaginationItem disabled={pageIndex === 0}>
          <PaginationLink first onClick={() => onPageChange(0)} />
        </PaginationItem>

        {getPageNumbers()}

        <PaginationItem disabled={pageIndex === totalPages - 1}>
          <PaginationLink last onClick={() => onPageChange(totalPages - 1)} />
        </PaginationItem>
      </Pagination>

      <InputGroup style={{ minWidth: "fit-content" }}>
        <Input
          type="number"
          style={{ maxWidth: "4rem" }}
          min="1"
          max={totalPages}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputSubmit}
        />
        <InputGroupText>/ {totalPages}</InputGroupText>
      </InputGroup>
    </div>
  );
};

PaginationComponent.propTypes = {
  pageIndex: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  hasPreviousPage: PropTypes.bool.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxPageNumbersToShow: PropTypes.number,
};

export default PaginationComponent;
