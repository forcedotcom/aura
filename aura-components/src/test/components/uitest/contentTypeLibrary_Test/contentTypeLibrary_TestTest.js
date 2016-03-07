({
    getConstructor: function (cmp) {
        return cmp.helper.lib.contentType;
    },
    MOCK_FILE_JPG : function () {
        return new File([],'mock-file.jpg',{ type : 'image/jpg'});
    },
    IMAGE_PNG  : 'image/png',
    IMAGE_JPG  : 'image/jpg',
    IMAGE_GIF  : 'image/gif',
    TEXT_HTML  : 'text/html',
    VIDEO_MPEG : 'video/mpeg',
    VIDEO_MP4  : 'video/mp4',

    testObjectCreation: {
        test: [
            function (cmp) {
                var ContentType = this.getConstructor(cmp);
                var myContentTypes1 = new ContentType();
                var myContentTypes2 = ContentType();
                $A.test.assertTrue('accept' in myContentTypes1,'Wrong creation');
                $A.test.assertTrue('accept' in myContentTypes2,'Wrong creation');
            }
        ]
    },
    testAcceptedMethod : {
        attributes : {  accept : 'image/jpg,image/gif' },
        test : [
            function (cmp) {
                var ContentType = this.getConstructor(cmp);
                var accept = cmp.get('v.accept');
                var myContentType = new ContentType(accept);
                $A.test.assertTrue(myContentType.accept(this.IMAGE_GIF), 'image/jpg,image/gif support image/gif');
                $A.test.assertTrue(myContentType.accept(this.IMAGE_JPG), 'image/jpg,image/gif support image/jpg');
                $A.test.assertFalse(myContentType.accept(this.TEXT_HTML),'image/jpg,image/gif does not support text/html');
                $A.test.assertFalse(myContentType.accept(this.IMAGE_PNG),'image/jpg,image/gif does not support image/png');
            }
        ]
    },
    testDontSetAccept : {
        test : function (cmp) {
            var ContentType = this.getConstructor(cmp);
            var myContentType = new ContentType();
            $A.test.assertFalse(myContentType.accept(this.IMAGE_GIF), 'empty accept does not support image/gif');
            $A.test.assertFalse(myContentType.accept(this.IMAGE_JPG), 'empty accept does support image/jpg');
            $A.test.assertFalse(myContentType.accept(this.TEXT_HTML),'empty accept does support text/html');
            $A.test.assertFalse(myContentType.accept(this.IMAGE_PNG),'empty accept does support image/png');
        }
    },
    testWrongAccept : {
        attributes : { accept : 'wrongContentType/jpg,video/*' },
        test : function (cmp) {
            var ContentType = this.getConstructor(cmp);
            var accept = cmp.get('v.accept');
            var myContentType = new ContentType(accept);
            $A.test.assertTrue(myContentType.accept(this.VIDEO_MPEG), 'video/* support all video formats');
            $A.test.assertTrue(myContentType.accept(this.VIDEO_MP4),  'video/* support all video formats');
            $A.test.assertFalse(myContentType.accept(this.TEXT_HTML), 'image/jpg,image/gif does not support text/html');
            $A.test.assertFalse(myContentType.accept(this.IMAGE_PNG), 'image/jpg,image/gif does not support image/png');
        }
    },
    testPassNullOrUndefined : {
        attributes : {  accept : 'image/jpg,image/gif' },
        test : [
            function (cmp) {
                var ContentType = this.getConstructor(cmp);
                var accept = cmp.get('v.accept');
                var myContentType = new ContentType(accept);
                $A.test.assertTrue(myContentType.accept(this.IMAGE_GIF), 'image/jpg,image/gif support image/gif');
                $A.test.assertTrue(myContentType.accept(this.IMAGE_JPG), 'image/jpg,image/gif support image/jpg');
                $A.test.assertFalse(myContentType.accept(null),'image/jpg,image/gif does not support text/html');
                $A.test.assertFalse(myContentType.accept(undefined),'image/jpg,image/gif does not support image/png');
            }
        ]
    },
    testCreateUsingNullOrUndefined : {
        test : function (cmp) {
            var ContentType = this.getConstructor(cmp);

            var myContentType = new ContentType(null);
            $A.test.assertFalse(myContentType.accept(this.IMAGE_GIF), 'empty accept does not support image/gif');
            $A.test.assertFalse(myContentType.accept(this.IMAGE_JPG), 'empty accept does support image/jpg');
            $A.test.assertFalse(myContentType.accept(this.TEXT_HTML),'empty accept does support text/html');
            $A.test.assertFalse(myContentType.accept(this.IMAGE_PNG),'empty accept does support image/png');

            var myContentType = new ContentType(undefined);
            $A.test.assertFalse(myContentType.accept(this.IMAGE_GIF), 'empty accept does not support image/gif');
            $A.test.assertFalse(myContentType.accept(this.IMAGE_JPG), 'empty accept does support image/jpg');
            $A.test.assertFalse(myContentType.accept(this.TEXT_HTML),'empty accept does support text/html');
        }
    },
    testSetAcceptAfterCreation :  {
        attributes : {  accept : 'image/jpg,image/gif' },
        test : [
            function (cmp) {
                var ContentType = this.getConstructor(cmp);
                var accept = cmp.get('v.accept');
                var myContentType = new ContentType().setAccepted(accept);
                $A.test.assertTrue(myContentType.accept(this.IMAGE_GIF), 'image/jpg,image/gif support image/gif');
                $A.test.assertTrue(myContentType.accept(this.IMAGE_JPG), 'image/jpg,image/gif support image/jpg');
                $A.test.assertFalse(myContentType.accept(null),'image/jpg,image/gif does not support null');
                $A.test.assertFalse(myContentType.accept(undefined),'image/jpg,image/gif does not support undefined');
            }
        ]
    },
    testPassingFileObject : {
        attributes : {  accept : 'image/jpg' },
        test : [
            function (cmp) {
                var ContentType = this.getConstructor(cmp);
                var accept = cmp.get('v.accept');
                var myContentType = new ContentType().setAccepted(accept);

                $A.test.assertTrue(myContentType.accept(this.MOCK_FILE_JPG()), 'image/jpg support File type image/jpg');
                $A.test.assertTrue(myContentType.accept(this.IMAGE_JPG), 'image/jpg support image/jpg');
                $A.test.assertFalse(myContentType.accept(this.TEXT_HTML),'image/jpg does not support text/html');
                $A.test.assertFalse(myContentType.accept(this.IMAGE_PNG),'image/jpg does not support image/png');
            }
        ]
    }
})