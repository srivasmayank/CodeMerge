import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';
import './Editor.css';
import Navbar from './Navbar';

const Editor = ({ socketRef, roomId, onHtmlCodeChange, onCssCodeChange, onJsCodeChange }) => {
    const htmlEditorRef = useRef(null);
    const cssEditorRef = useRef(null);
    const jsEditorRef = useRef(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        function initEditors() {
            // Initialize HTML editor
            htmlEditorRef.current = Codemirror.fromTextArea(
                document.getElementById('htmlEditor'),
                {
                    mode: 'htmlmixed',
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            // Initialize CSS editor
            cssEditorRef.current = Codemirror.fromTextArea(
                document.getElementById('cssEditor'),
                {
                    mode: 'css',
                    theme: 'dracula',
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            // Initialize JavaScript editor
            jsEditorRef.current = Codemirror.fromTextArea(
                document.getElementById('jsEditor'),
                {
                    mode: 'javascript',
                    theme: 'dracula',
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            // Event listener for HTML editor changes
            htmlEditorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const htmlCode = instance.getValue();
                onHtmlCodeChange(htmlCode);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        htmlCode,
                        cssCode: cssEditorRef.current.getValue(),
                        jsCode: jsEditorRef.current.getValue(),
                    });
                    updateIframeContent(htmlCode, cssEditorRef.current.getValue(), jsEditorRef.current.getValue());
                }
            });

            // Event listener for CSS editor changes
            cssEditorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const cssCode = instance.getValue();
                onCssCodeChange(cssCode);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        htmlCode: htmlEditorRef.current.getValue(),
                        cssCode,
                        jsCode: jsEditorRef.current.getValue(),
                    });
                    updateIframeContent(htmlEditorRef.current.getValue(), cssCode, jsEditorRef.current.getValue());
                }
            });

            // Event listener for JavaScript editor changes
            jsEditorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const jsCode = instance.getValue();
                onJsCodeChange(jsCode);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        htmlCode: htmlEditorRef.current.getValue(),
                        cssCode: cssEditorRef.current.getValue(),
                        jsCode,
                    });
                    updateIframeContent(htmlEditorRef.current.getValue(), cssEditorRef.current.getValue(), jsCode);
                }
            });
        }

        initEditors();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ htmlCode, cssCode, jsCode }) => {
                if (htmlCode !== null) {
                    htmlEditorRef.current.setValue(htmlCode);
                }
                if (cssCode !== null) {
                    cssEditorRef.current.setValue(cssCode);
                }
                if (jsCode !== null) {
                    jsEditorRef.current.setValue(jsCode);
                }
                updateIframeContent(htmlCode, cssCode, jsCode);
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    const updateIframeContent = (htmlCode, cssCode, jsCode) => {
        const iframe = iframeRef.current;
        const document = iframe.contentDocument;
        document.open();
        document.write(`
            <html>
                <head>
                    <style>${cssCode}</style>
                    <script>${jsCode}</script>
                </head>
                <body>
                    ${htmlCode}
                </body>
            </html>
        `);
        document.close();
    };

    return (
        <>
            <div className="editorContainer">
                <textarea id="htmlEditor" defaultValue="<html>\n\t\n</html>"></textarea>
                <textarea id="cssEditor" defaultValue="/* Enter your CSS styles here */"></textarea>
                <textarea id="jsEditor" defaultValue="// Enter your JavaScript here"></textarea>
            </div>
            <iframe
                ref={iframeRef}
                style={{ width: '100%', height: '500px', border: '1px solid black', marginTop: '10px' }}
            ></iframe>
        </>
    );
};

export default Editor;
