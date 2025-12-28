import React from "react";
import { Container, ContainerProps } from "@mui/material";

interface PageContainerProps extends Omit<ContainerProps, "maxWidth"> {
  children: React.ReactNode;
  /**
   * Set to true to use a constrained width (maxWidth="lg")
   * Default is false (full width)
   */
  constrained?: boolean;
}

/**
 * PageContainer - A reusable container component for all pages
 * By default, it uses the full horizontal screen width
 * Set constrained={true} for pages that need a max-width constraint
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  constrained = false,
  sx,
  ...props
}) => {
  return (
    <Container
      maxWidth={constrained ? "lg" : false}
      sx={{
        mt: 4,
        mb: 4,
        px: constrained ? 3 : 4,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

export default PageContainer;
