function useDevice() {
    if (window.screen.width < 576) return "MOBILE";
    else if (window.screen.width < 769) return "TABLET";
    return "LAPTOP"
}

export default useDevice;