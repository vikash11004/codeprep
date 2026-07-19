import { useRef, useEffect } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { oneDark, oneDarkHighlightStyle } from '@codemirror/theme-one-dark';

export const DEFAULT_CODE = {
  'JavaScript': `// Write your solution here
function solution(input) {
  // Your code here
}
`,
  'Python': `# Write your solution here
def solution(input):
    # Your code here
    pass
`,
  'Java': `// Write your solution here
class Solution {
    public void solution() {
        // Your code here
    }
}
`,
  'C++': `// Write your solution here
#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    void solution() {
        // Your code here
    }
};
`,
  'C': `// Write your solution here
#include <stdio.h>
#include <stdlib.h>

void solution() {
    // Your code here
}
`
};

const languageConf = new Compartment();

function getLanguageExtension(lang) {
  switch (lang?.toLowerCase()) {
    case 'python':
    case 'python3':
      return python();
    case 'java':
      return java();
    case 'c++':
    case 'cpp':
    case 'c':
      return cpp();
    case 'javascript':
    case 'js':
    default:
      return javascript();
  }
}

export default function CodeEditor({ value, onChange, defaultValue, language = 'C++' }) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange) {
        onChange(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value || defaultValue || DEFAULT_CODE[language] || DEFAULT_CODE['C++'],
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        foldGutter(),
        highlightSelectionMatches(),
        syntaxHighlighting(oneDarkHighlightStyle),
        oneDark,
        history(),
        languageConf.of(getLanguageExtension(language)),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...closeBracketsKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
        updateListener,
        EditorView.theme({
          '&': {
            fontSize: '14px',
            height: '100%',
            backgroundColor: '#0b1120',
            color: '#e5e7eb',
          },
          '.cm-content': {
            fontFamily: 'var(--font-mono)',
            padding: '18px 0 40px',
            caretColor: '#67e8f9',
          },
          '.cm-gutters': {
            borderRight: '1px solid #1f2937',
            backgroundColor: '#0b1120',
            color: '#64748b',
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#16213a',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (viewRef.current && value !== undefined) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (value !== currentDoc) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentDoc.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  // Update language dynamically
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: languageConf.reconfigure(getLanguageExtension(language))
      });
    }
  }, [language]);

  return (
    <div 
      ref={containerRef} 
      className="h-full overflow-hidden border border-surface-500 bg-surface-800 rounded"
    />
  );
}
