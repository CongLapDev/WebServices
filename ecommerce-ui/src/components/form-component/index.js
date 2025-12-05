import styled from "styled-components";

// Named as FormError internally to avoid conflict with native Error constructor
const FormError = styled.span`
    color:var(--danger-color);
    font-size: 0.8rem;
    font-weight: 500;
    min-height: 0.8rem;
    display: block;
`

// Export as Error for backward compatibility with existing imports
export default FormError;