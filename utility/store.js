import create from 'zustand'

const useStore = create(set => ({
  bears: 0,
  navBarExpanded: "",
  walletAddress: "",
  WalletAccount: "",
  modalData: {},
  blurV: false,
  displayModal: false,
  providerInsatnce: "",
  setDisplayModalTrue: () => set({ displayModal: true }),
  setDisplayModalFalse: () => set({ displayModal: false }),
  expandMobileNav: (val) => set(state => ({ navBarExpanded: val })),
  setModalData: (val) => set(state => ({ modalData: val })),
  closeMobileNavBar: () => set(state => ({ navBarExpanded: ""  })),
  removeAllBears: () => set({ bears: 0 }),
  setWalletAddress: (val) => set(state => ({ walletAddress: val })),
  setWalletAccount: (val) => set(state => ({ WalletAccount: val })),
  setProvInstance: (val) => set(state => ({ providerInsatnce: val })),
  setBlurV: (val) => set(state => ({ blurV: val })),
}))

export default useStore;