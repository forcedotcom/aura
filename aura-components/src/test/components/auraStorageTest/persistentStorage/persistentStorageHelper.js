({
    setEncryptionKey: function(encryptionKey) {
        var buffer = new ArrayBuffer(32);
        var view = new Uint8Array(buffer);
        view.set(encryptionKey);
        $A.storageService.CryptoAdapter.setKey(buffer);
    }
})
