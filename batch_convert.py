#!/usr/bin/env python3
"""
Convert AoPS MediaWiki raw source (source_rjina.md) to proper Markdown + LaTeX.

Handles:
- MediaWiki section headers (== ... ==) → Markdown headers (## ...)
- Bare LaTeX commands → wrapped in $...$ or $$...$$
- \\begin{...}...\\end{...} environments → wrapped in $$...$$
- Asymptote diagram code → code blocks with note
- Wiki templates ({{...}}) → Markdown equivalents or removed
- Wiki links ([[...|...]]) → Markdown links
- Author credits (~username) → formatted attributions
- \\( ... \\) delimiters → $...$
- Category tags → removed
- See Also / navigation sections → removed

Usage:
    python convert.py [base_directory]
"""

import re
import os
import sys

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

LATEX_COMMANDS = {
    # Formatting
    'textbf', 'text', 'textrm', 'textit', 'mathrm', 'mathbf', 'mathbb',
    'mathcal', 'mathfrak', 'boldsymbol', 'emph',
    # Fractions & roots
    'frac', 'dfrac', 'tfrac', 'cfrac', 'sqrt', 'root',
    # Boxes & decorations
    'boxed', 'overline', 'underline', 'widehat', 'widetilde',
    'overrightarrow', 'overleftarrow', 'vec', 'hat', 'bar', 'tilde', 'dot',
    # Arrows
    'Rightarrow', 'Leftarrow', 'rightarrow', 'leftarrow',
    'Longrightarrow', 'Longleftarrow', 'longrightarrow', 'longleftarrow',
    'implies', 'iff', 'to', 'gets', 'mapsto',
    # Operators
    'cdot', 'times', 'div', 'pm', 'mp', 'oplus', 'otimes',
    'cap', 'cup', 'setminus', 'circ',
    # Spacing
    'qquad', 'quad', 'hspace', 'vspace', 'hfill',
    # Greek letters
    'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon',
    'zeta', 'eta', 'theta', 'vartheta', 'iota', 'kappa',
    'lambda', 'mu', 'nu', 'xi', 'pi', 'varpi',
    'rho', 'varrho', 'sigma', 'varsigma', 'tau', 'upsilon',
    'phi', 'varphi', 'chi', 'psi', 'omega',
    'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi',
    'Sigma', 'Upsilon', 'Phi', 'Psi', 'Omega',
    # Relations
    'le', 'ge', 'leq', 'geq', 'neq', 'ne', 'approx', 'equiv', 'sim',
    'prec', 'succ', 'preceq', 'succeq', 'll', 'gg',
    'in', 'notin', 'ni', 'subset', 'supset', 'subseteq', 'supseteq',
    # Big operators
    'sum', 'prod', 'int', 'iint', 'iiint', 'oint',
    'bigcup', 'bigcap', 'bigoplus', 'bigotimes',
    # Limits & functions
    'lim', 'limsup', 'liminf', 'inf', 'sup', 'max', 'min',
    'log', 'ln', 'exp', 'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
    'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh',
    'det', 'dim', 'ker', 'gcd', 'lcm', 'deg', 'mod', 'bmod', 'pmod',
    # Combinatorics
    'binom', 'dbinom', 'tbinom', 'choose',
    # Delimiters
    'left', 'right', 'bigl', 'bigr', 'Bigl', 'Bigr',
    'biggl', 'biggr', 'Biggl', 'Biggr', 'middle',
    'lfloor', 'rfloor', 'lceil', 'rceil', 'langle', 'rangle',
    # Dots
    'ldots', 'cdots', 'vdots', 'ddots', 'dots',
    # Accents & misc
    'angle', 'triangle', 'square', 'star',
    'infty', 'partial', 'nabla', 'forall', 'exists', 'neg', 'not',
    'emptyset', 'varnothing',
    # Color
    'color', 'textcolor',
    # Logic
    'because', 'therefore', 'land', 'lor', 'lnot',
    # Environments (handled separately but listed for detection)
    'begin', 'end',
    # Table/array helpers
    'hline', 'cline', 'multicolumn',
    # Misc formatting
    'renewcommand', 'newcommand', 'arraystretch', 'centering',
    'LaTeX', 'TeX',
}

LATEX_ENVS = {
    'align', 'align*', 'alignat', 'alignat*',
    'array', 'matrix', 'pmatrix', 'bmatrix', 'vmatrix', 'Vmatrix',
    'cases', 'gather', 'gather*', 'equation', 'equation*',
    'eqnarray', 'eqnarray*', 'multline', 'multline*',
    'split', 'flalign', 'flalign*',
    'centering',
}

# Common 2-letter English words that should NOT appear inside math delimiters.
# These are words that the bare-math and merge heuristics may accidentally absorb.
# Excludes math-variable-like pairs (pq, xy, etc.) and LaTeX commands (in, to, etc.)
COMMON_ENGLISH_2LETTER = frozenset({
    'of', 'as', 'is', 'or', 'by', 'at', 'if', 'an',
    'be', 'he', 'it', 'me', 'my', 'no', 'on', 'so', 'up', 'us', 'we', 'do', 'go',
})


def contains_english_word(text):
    """Check if text contains English words (not just math variables/expressions).

    Returns True if text contains:
    - 3+ consecutive lowercase letters (existing heuristic), OR
    - A common 2-letter English word at a word boundary

    LaTeX command names (\\cos, \\sin, \\frac, etc.) are stripped before checking,
    so they don't trigger false positives.
    """
    # Strip LaTeX command names before checking — they aren't English words
    cleaned = re.sub(r'\\[a-zA-Z]+', '', text)
    if re.search(r'[a-z]{3,}', cleaned):
        return True
    # Check for common 2-letter English words at word boundaries
    for word in re.findall(r'(?<![a-zA-Z])([a-z]{2})(?![a-zA-Z])', cleaned):
        if word in COMMON_ENGLISH_2LETTER:
            return True
    return False

# Asymptote code indicators - use REGEX patterns for precision
ASY_PATTERNS = [
    r'\bunitsize\s*\(',
    r'(?<!\w)size\s*\(\d',
    r'(?<![a-zA-Z])draw\s*\(',
    r'(?<![a-zA-Z])fill\s*\(',
    r'(?<![a-zA-Z])filldraw\s*\(',
    r'(?<![a-zA-Z])dot\s*\(["\']',
    r'(?<![a-zA-Z])label\s*\(["\']',
    r'^pair\s+\w+\s*=',
    r'^real\s+\w+\s*[=;]',
    r'^int\s+\w+\s*[=;]',
    r'\bdefaultpen\s*\(',
    r'(?<![\\])usepackage\s*\(',
    r'^path\s+\w+',
    r'\bcurrentpen\b',
    r'\bcurrentprojection\b',
]


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def remove_header(text):
    """Remove the metadata header (Title, URL, Published Time, Markdown Content:)."""
    lines = text.split('\n')
    content_start = 0
    for i, line in enumerate(lines):
        if line.strip() == 'Markdown Content:':
            content_start = i + 1
            break
    if content_start == 0:
        return text
    return '\n'.join(lines[content_start:])


def is_asymptote_code(line):
    """Check if a line contains Asymptote drawing code."""
    stripped = line.strip()
    if not stripped:
        return False
    for pat in ASY_PATTERNS:
        if re.search(pat, stripped):
            return True
    return False


def find_balanced_brace(text, start):
    """Find the matching closing brace. Returns index after }, or -1."""
    if start >= len(text) or text[start] != '{':
        return -1
    depth = 1
    i = start + 1
    while i < len(text) and depth > 0:
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
        i += 1
    return i if depth == 0 else -1


def has_latex_content(text):
    """Check if text contains LaTeX commands or math syntax."""
    if re.search(r'\\[a-zA-Z]+', text):
        return True
    if '{:}' in text:
        return True
    if re.search(r'[\^_]\{', text):
        return True
    if re.search(r'[a-zA-Z]\^[0-9a-zA-Z]', text):
        return True
    # Escaped braces for set notation: \{...\}
    if '\\{' in text or '\\}' in text:
        return True
    return False


def has_bare_math(text):
    """Check if text contains bare math expressions (no LaTeX commands) that need wrapping.

    Detects patterns like: 8h, 12(h-1), 24/8 = 3, D_B(t), F(t)=0, t = 3, =16
    These appear in AMC solution prose without $ delimiters.
    """
    # Skip lines already fully wrapped or special lines
    stripped = text.strip()
    if not stripped or stripped.startswith('$') or stripped.startswith('#'):
        return False
    if stripped.startswith('*~') or stripped.startswith('http'):
        return False

    # Pattern 1: digit immediately followed by lowercase variable letter(s) then word boundary
    # Matches: 8h, 12x, 8t, 3n — but NOT 12th, 8am, 3rd
    # Require the variable part to be a single letter (common in math), or followed by ( or space/end
    if re.search(r'\d+[a-z]\b(?![\w])', stripped):
        # Filter out ordinals (1st, 2nd, 3rd, 4th, etc.) and time suffixes
        match = re.search(r'\d+([a-z]+)\b', stripped)
        if match:
            suffix = match.group(1)
            if suffix not in ('st', 'nd', 'rd', 'th', 'am', 'pm', 'mph', 'ft'):
                return True

    # Pattern 2: digit(s) followed by ( — like 12(h-1), 0.2(10)
    if re.search(r'\d\(', stripped):
        return True

    # Pattern 3: division with digits: 24/8
    if re.search(r'\d+/\d+', stripped):
        return True

    # Pattern 4: function subscript notation: D_A, D_B, x_1, a_n (no preceding \)
    if re.search(r'(?<!\\)[A-Za-z]_[A-Za-z0-9]', stripped):
        return True

    # Pattern 5: function notation with parens: F(t), D(t), f(x), g(n)
    # Single uppercase or lowercase letter followed by (single_var)
    if re.search(r'\b[A-Za-z]\([a-z]\)', stripped):
        return True

    # Pattern 6: equals with digits after a word: "Andy =16" or "= 24"
    # Check each occurrence of =digit, not just the first one
    for m in re.finditer(r'[A-Za-z]\s*=\s*\d', stripped):
        pos = m.start()
        # Count $ before this position to see if we're inside math
        dollar_count = stripped[:pos].count('$')
        if dollar_count % 2 == 0:  # Not inside $...$
            return True

    # Pattern 7: simple variable = number in text: "t = 3 hours", "x = 5"
    if re.search(r'\b[a-z]\s*=\s*\d', stripped):
        return True

    # Pattern 8: bare arithmetic: 11 + 11 = 22, 20 - 11 + 1 = 10, 6+2-1 = 7
    if re.search(r'\d+\s*[+\-]\s*\d+\s*=\s*\d+', stripped):
        for m in re.finditer(r'\d+\s*[+\-]\s*\d+\s*=\s*\d+', stripped):
            if not is_in_math_simple(stripped, m.start()):
                return True

    # Pattern 9: bare comparison: 22 > 20, n < 5
    if re.search(r'\d+\s*[><]\s*\d+', stripped):
        for m in re.finditer(r'\d+\s*[><]\s*\d+', stripped):
            if not is_in_math_simple(stripped, m.start()):
                return True

    # Pattern 10: single variable + operator + digit: r+1, k-1, m/2
    if re.search(r'(?<![a-zA-Z])[a-z][+\-]\d', stripped):
        for m in re.finditer(r'(?<![a-zA-Z])([a-z])[+\-]\d', stripped):
            if not is_in_math_simple(stripped, m.start()):
                return True

    # Pattern 11: bare math prefix immediately before $: "x=$", "2+3=$", "r =$"
    if re.search(r'[a-zA-Z0-9][+\-*/=]\s*\$', stripped):
        return True

    return False


def is_in_math_simple(text, pos):
    """Quick check if position is inside $...$ based on dollar count parity."""
    count = 0
    i = 0
    while i < pos:
        if text[i] == '$':
            if i + 1 < len(text) and text[i+1] == '$':
                i += 2
                continue
            count += 1
        i += 1
    return count % 2 == 1


def count_english_words(text):
    """Count English words (3+ letters, not LaTeX commands) in text."""
    cleaned = re.sub(r'\\[a-zA-Z]+', '', text)
    cleaned = re.sub(r'[0-9\s{}()\[\]+\-=*/\^_.,|&<>!;:\\\'"~`%@#]+', ' ', cleaned)
    words = [w.strip() for w in cleaned.split() if len(w.strip()) >= 3]
    return len(words)


def is_display_math_line(line):
    """Determine if a line should be treated as display math."""
    stripped = line.strip()
    if not stripped:
        return False

    # Already wrapped
    if stripped.startswith('$') or stripped.startswith('$$'):
        return False

    # Lines starting with \begin{ are display math
    if stripped.startswith('\\begin{'):
        return True

    # Lines that are \Rightarrow, \implies, etc. continuations
    if re.match(r'^\\(Rightarrow|implies|Leftarrow|therefore|because|iff)\b', stripped):
        return True

    # Answer choice lines: \textbf{(A)} ...
    if re.match(r'^\\textbf\{\s*\(?[A-F]\)?', stripped):
        return True

    # Lines with LaTeX commands and NO English words (3+ letters)
    if has_latex_content(stripped):
        eng_words = count_english_words(stripped)
        if eng_words == 0:
            return True

    # Lines that look like equations: variables, numbers, operators, no English words
    if re.match(r'^[0-9a-zA-Z\s()\[\]+\-=*/\^_.,{}\\%|]+$', stripped):
        if '=' in stripped:
            words = re.findall(r'[a-zA-Z]{3,}', stripped)
            latex_cmds = set(re.findall(r'\\([a-zA-Z]+)', stripped))
            math_words = {'mph', 'lcm', 'gcd', 'max', 'min', 'log', 'cos', 'sin', 'tan',
                         'det', 'dim', 'mod', 'deg', 'exp', 'inf', 'sup', 'lim', 'arctan',
                         'arcsin', 'arccos', 'sec', 'csc', 'cot', 'ln', 'miles', 'pounds'}
            real_words = [w for w in words if w not in latex_cmds and w.lower() not in math_words]
            if not real_words:
                return True

    return False


def _is_math_continuation(text, pos):
    """Check if text at pos looks like math content (not English text)."""
    if pos >= len(text):
        return False
    ch = text[pos]
    # LaTeX command
    if ch == '\\' and pos + 1 < len(text) and text[pos+1].isalpha():
        return True
    # Digit
    if ch.isdigit():
        return True
    # Math operators
    if ch in '=<>+-*/^_()':
        return True
    # Short uppercase sequence (geometric label like BAC, BD)
    if ch.isupper():
        m = pos
        while m < len(text) and text[m].isupper():
            m += 1
        # 1-5 uppercase letters followed by non-letter = geometric label
        if 1 <= m - pos <= 5 and (m >= len(text) or not text[m].islower()):
            return True
    return False


def wrap_inline_latex_in_line(line):
    """Find and wrap LaTeX fragments within a mixed text+math line with $...$."""
    if not has_latex_content(line):
        return line

    stripped = line.strip()
    if stripped.startswith('$') and stripped.endswith('$'):
        return line

    result = []
    i = 0
    text = line
    last_math_end = -1  # Track end position in original text of last math fragment

    while i < len(text):
        # Check for \( ... \)
        if text[i:i+2] == '\\(':
            end = text.find('\\)', i + 2)
            if end != -1:
                result.append('$')
                result.append(text[i+2:end])
                result.append('$')
                i = end + 2
                last_math_end = i
                continue

        # Check for \{ or \} (escaped braces for set notation)
        if text[i] == '\\' and i + 1 < len(text) and text[i+1] in '{}':
            accumulated = ''.join(result)
            dollar_count = accumulated.count('$')
            if dollar_count % 2 == 0:
                # Not inside $, find the extent of the set expression
                # \{1,2,3,...,20\} or \{...\}
                if text[i+1] == '{':
                    # Find matching \}
                    end = text.find('\\}', i + 2)
                    if end != -1:
                        result.append('$')
                        result.append(text[i:end+2])
                        result.append('$')
                        i = end + 2
                        last_math_end = i
                        continue
                # Just a \}, wrap it alone
                result.append('$')
                result.append(text[i:i+2])
                result.append('$')
                i += 2
                last_math_end = i
                continue
            else:
                result.append(text[i:i+2])
                i += 2
                continue

        # Check for LaTeX command
        if text[i] == '\\' and i + 1 < len(text) and text[i+1].isalpha():
            j = i + 1
            while j < len(text) and text[j].isalpha():
                j += 1
            cmd = text[i+1:j]

            if cmd in LATEX_COMMANDS:
                math_start = i

                # Look backwards to include leading math chars (e.g., "64\%" → "64",
                # "y-27=\frac" → "y-27=")
                # But NEVER look back past the end of a previous math fragment
                digits_before = 0
                back = i - 1
                while back >= 0 and back >= last_math_end and (
                    text[back].isdigit() or text[back] in '.-=+*/^'
                    or (text[back].islower() and back > 0 and (
                        back - 1 < last_math_end or text[back-1] in ' =+-*/^('
                    ))
                ):
                    back -= 1
                    digits_before += 1
                if digits_before > 0 and (text[back+1].isdigit() or text[back+1] == '-' or text[back+1].islower()):
                    math_start = i - digits_before
                    # Remove already-appended digit characters from result
                    # Safety: only pop if the item is actually a digit/period, never pop '$'
                    popped = 0
                    for _ in range(digits_before):
                        if result and result[-1] not in ('$',) and len(result[-1]) == 1:
                            result.pop()
                            popped += 1
                        else:
                            break
                    if popped < digits_before:
                        # Couldn't pop all expected digits; adjust math_start
                        math_start = i - popped

                # Find the end of the math expression
                k = j
                while k < len(text):
                    if text[k] == '{':
                        end_brace = find_balanced_brace(text, k)
                        if end_brace > 0:
                            k = end_brace
                        else:
                            k += 1
                    elif text[k] in ('^', '_'):
                        k += 1
                        if k < len(text) and text[k] == '{':
                            end_brace = find_balanced_brace(text, k)
                            if end_brace > 0:
                                k = end_brace
                            else:
                                k += 1
                        elif k < len(text) and text[k] == '\\':
                            # ^\ or _\ → superscript/subscript with LaTeX command
                            m = k + 1
                            while m < len(text) and text[m].isalpha():
                                m += 1
                            nc = text[k+1:m]
                            if nc in LATEX_COMMANDS:
                                k = m
                            else:
                                k += 1
                        elif k < len(text):
                            k += 1
                    elif text[k] == '\\' and k + 1 < len(text) and text[k+1].isalpha():
                        # Another LaTeX command immediately following (no space)
                        m = k + 1
                        while m < len(text) and text[m].isalpha():
                            m += 1
                        nc = text[k+1:m]
                        if nc in LATEX_COMMANDS:
                            k = m
                        else:
                            break
                    elif text[k] == ' ':
                        # Space: look ahead for math continuation
                        peek = k + 1
                        while peek < len(text) and text[peek] == ' ':
                            peek += 1
                        if peek < len(text) and _is_math_continuation(text, peek):
                            k = peek  # skip spaces, continue with math
                        else:
                            break
                    elif text[k].isdigit() or text[k] in '.,+-':
                        k += 1
                    elif text[k].isupper():
                        # Uppercase letters: include if short sequence (geometric label)
                        m = k
                        while m < len(text) and text[m].isupper():
                            m += 1
                        if m - k <= 5 and (m >= len(text) or not text[m].islower()):
                            k = m
                        else:
                            break
                    elif text[k] in '=<>':
                        # Math operators: include and continue
                        k += 1
                    elif text[k] == '(':
                        # Find matching ) and include if content is math-like
                        paren_depth = 1
                        j = k + 1
                        while j < len(text) and paren_depth > 0:
                            if text[j] == '(':
                                paren_depth += 1
                            elif text[j] == ')':
                                paren_depth -= 1
                            j += 1
                        if paren_depth == 0:
                            inner = text[k+1:j-1]
                            # Include if inner content is short, math-like (no long words)
                            if len(inner) <= 30 and not re.search(r'[a-z]{4,}', inner):
                                k = j  # skip past closing )
                            else:
                                k += 1  # just include the (
                        else:
                            k += 1
                    elif text[k] == ')':
                        k += 1
                    elif text[k].islower():
                        # Lowercase letter after math context (e.g., x in (x-18))
                        prev = text[k-1] if k > 0 else ''
                        if prev in '(+-*/=^_,{':
                            k += 1
                        else:
                            break
                    else:
                        break

                # Trailing digits
                while k < len(text) and (text[k].isdigit() or text[k] in '.,'):
                    k += 1

                math_fragment = text[math_start:k].strip()

                # Check if already inside $ delimiters
                accumulated = ''.join(result)
                dollar_count = accumulated.count('$')
                if dollar_count % 2 == 1:
                    result.append(text[i:k])
                else:
                    if math_start > i:
                        result.append(text[i:math_start])
                    result.append('$')
                    result.append(math_fragment)
                    result.append('$')

                i = k
                last_math_end = k
                continue
            else:
                result.append(text[i])
                i += 1
        elif text[i] == '{' and i + 1 < len(text) and text[i+1] == ':' and i + 2 < len(text) and text[i+2] == '}':
            # {:} - LaTeX time colon
            accumulated = ''.join(result)
            dollar_count = accumulated.count('$')

            if dollar_count % 2 == 0:
                # Not inside $, wrap with surrounding digits
                digits = []
                temp_result = list(result)
                while temp_result and len(temp_result[-1]) == 1 and temp_result[-1].isdigit():
                    digits.insert(0, temp_result.pop())
                forward_digits = []
                fi = i + 3
                while fi < len(text) and text[fi].isdigit():
                    forward_digits.append(text[fi])
                    fi += 1

                if digits or forward_digits:
                    result = temp_result
                    result.append('$')
                    result.extend(digits)
                    result.append('{:}')
                    result.extend(forward_digits)
                    result.append('$')
                    i = fi
                    last_math_end = fi
                else:
                    result.append('{:}')
                    i += 3
            else:
                result.append('{:}')
                i += 3
        elif text[i:i+2] in ('^{', '_{') and i > 0:
            accumulated = ''.join(result)
            dollar_count = accumulated.count('$')
            if dollar_count % 2 == 0:
                temp_result = list(result)
                base_chars = []
                while temp_result and (temp_result[-1].isalnum() or temp_result[-1] in '.)') and temp_result[-1] != '$':
                    base_chars.insert(0, temp_result.pop())

                end_brace = find_balanced_brace(text, i + 1)
                if end_brace > 0 and base_chars:
                    result = temp_result
                    result.append('$')
                    result.extend(base_chars)
                    result.append(text[i:end_brace])
                    result.append('$')
                    i = end_brace
                    last_math_end = end_brace
                else:
                    result.append(text[i])
                    i += 1
            else:
                result.append(text[i])
                i += 1
        else:
            result.append(text[i])
            i += 1

    return ''.join(result)


def wrap_bare_math_in_line(line):
    """Wrap bare math expressions (without LaTeX commands) in $...$ delimiters.

    Handles patterns that wrap_inline_latex_in_line() misses because they
    contain no backslash-prefixed LaTeX commands:
      - Number-variable products: 8h, 12x, 8t
      - Expressions with parens: 12(h-1), 0.2(10)
      - Division: 24/8 = 3
      - Function subscripts: D_B(t) = 12(t-1)
      - Function notation: F(t)=0
      - Variable assignments: t = 3
      - Value labels: Andy =16

    Called AFTER wrap_inline_latex_in_line() to catch remaining bare math.
    """
    stripped = line.strip()
    if not stripped or stripped.startswith('#') or stripped.startswith('$'):
        return line
    if stripped.startswith('*~') or stripped.startswith('http') or stripped.startswith('>'):
        return line
    if stripped.startswith('```'):
        return line

    # Don't process lines that are entirely inside $...$ already
    if stripped.startswith('$') and stripped.endswith('$'):
        return line

    # Protect URLs from being processed: replace with placeholders
    url_placeholders = {}
    url_counter = [0]

    def replace_url(m):
        key = f'\x00URL{url_counter[0]}\x00'
        url_placeholders[key] = m.group(0)
        url_counter[0] += 1
        return key

    stripped = re.sub(r'https?://[^\s\)]+', replace_url, stripped)
    # Also protect markdown link URLs: [text](url) and [url text]
    stripped = re.sub(r'\[https?://[^\]]+\]', replace_url, stripped)

    # Helper: check if position is inside existing $...$ delimiters
    def is_in_math(text, pos):
        """Check if position pos is inside $...$ (odd number of $ before it)."""
        count = 0
        i = 0
        while i < pos:
            if text[i] == '$':
                # Skip $$ (display math delimiter)
                if i + 1 < len(text) and text[i+1] == '$':
                    i += 2
                    continue
                count += 1
            i += 1
        return count % 2 == 1

    result = stripped

    # --- Pass 0A: Standalone subscript variables with optional =number ---
    # Matches: EH_1=24, A_1=10 (subscript variable followed by =number)
    def wrap_subscript_eq(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        return f'${m.group(1)}$'

    result = re.sub(
        r'(?<![A-Za-z$\\])([A-Z]*[A-Za-z]_[A-Za-z0-9]+[A-Za-z0-9_]*\s*=\s*\d+(?:[.,]\d+)?)',
        wrap_subscript_eq,
        result
    )

    # --- Pass 0B: Standalone subscript variables ---
    # Matches: H_1, A_1, AH_1, OA_1A_2, H_2B, EH_1, B_H1
    def wrap_subscript_var(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        return f'${m.group(1)}$'

    result = re.sub(
        r'(?<![A-Za-z$\\])([A-Z]*[A-Za-z]_[A-Za-z0-9]+[A-Za-z0-9_]*)',
        wrap_subscript_var,
        result
    )

    # --- Pass 0C: Bare arithmetic: 11 + 11 = 22, 20 - 11 + 1 = 10, 6+2-1 = 7 ---
    def wrap_arithmetic(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        return f'${m.group(0).strip()}$'

    result = re.sub(
        r'(?<!\$)(\d+\s*[+\-]\s*\d+(?:\s*[+\-]\s*\d+)*\s*=\s*\d+)',
        wrap_arithmetic,
        result
    )

    # --- Pass 0D: Bare comparison: 22 > 20, n < 5 ---
    def wrap_comparison(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        return f'${m.group(0).strip()}$'

    result = re.sub(
        r'(?<!\$)(\d+\s*[><]\s*\d+)',
        wrap_comparison,
        result
    )

    # --- Pass 0E: Single variable + operator + digit: r+1, k-1 ---
    # IMPORTANT: Skip if inside digit(...) — those are handled by number-paren pass later
    def wrap_var_op_digit(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        # Don't wrap if inside parentheses preceded by a digit (like 12(h-1))
        pos = m.start()
        paren_pos = result.rfind('(', 0, pos)
        if paren_pos >= 0:
            # Check if this ( is preceded by a digit and hasn't been closed yet
            close_pos = result.find(')', paren_pos, pos)
            if close_pos < 0 and paren_pos > 0 and result[paren_pos - 1].isdigit():
                return m.group(0)  # Skip — number-paren pass handles this
        return f'${m.group(1)}$'

    result = re.sub(
        r'(?<![a-zA-Z$])([a-z][+\-]\d+(?:[+\-]\d+)?)',
        wrap_var_op_digit,
        result
    )

    # --- Pass 1: Function subscript notation: D_A(t) = 12(t-1) or x_1 ---
    # Match: letter_letter/digit possibly followed by (expr) and = expr
    def wrap_func_subscript(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        return f'${m.group(0)}$'

    # D_A(t) = 8t, or D_B(t) = 12(t-1) for ... — whole equation
    result = re.sub(
        r'(?<!\$)(?<!\\)([A-Z]_[A-Za-z]\([a-z]\)\s*(?::?=)\s*[0-9a-z()\s+\-*/,.]+?)(?=\s+(?:for|where|when|if|and|so|since|then|thus)\b|[.;,](?:\s|$)|\s*$)',
        lambda m: m.group(0) if is_in_math(result, m.start()) else f'${m.group(1).strip()}$',
        result
    )

    # Standalone F(t)=0 or f(x) = 5 patterns (short function equations)
    result = re.sub(
        r'(?<!\$)(?<![a-zA-Z])([A-Za-z]\([a-z]\)\s*=\s*[0-9a-z()+\-*/^_.]+)',
        lambda m: m.group(0) if is_in_math(result, m.start()) else f'${m.group(1).strip()}$',
        result
    )

    # --- Pass 2: Number-variable products and paren expressions ---
    # Match: 8h, 12x, 8t (number followed by single lowercase letter)
    # But not ordinals (1st, 2nd, 3rd, 4th) or units (8am, 12pm, 8mph)
    ORDINAL_SUFFIXES = {'st', 'nd', 'rd', 'th', 'am', 'pm'}

    def wrap_num_var(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        suffix = m.group(2)
        if suffix in ORDINAL_SUFFIXES:
            return m.group(0)
        return f'${m.group(1)}{m.group(2)}$'

    result = re.sub(
        r'(?<!\$)(?<![a-zA-Z])(\d+(?:\.\d+)?)([a-z])\b(?!\w)(?!\$)',
        wrap_num_var,
        result
    )

    # Number immediately followed by paren expression: 12(h-1), 0.2(10+x)
    def wrap_num_paren(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        return f'${m.group(0)}$'

    result = re.sub(
        r'(?<!\$)(?<![a-zA-Z])(\d+(?:\.\d+)?)\(([^)]+)\)(?!\$)',
        wrap_num_paren,
        result
    )

    # --- Pass 3: Division with digits: 24/8 = 3 ---
    def wrap_division_eq(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        return f'${m.group(0).strip()}$'

    result = re.sub(
        r'(?<!\$)(?<![a-zA-Z])(\d+/\d+\s*=\s*\d+)(?!\$)',
        wrap_division_eq,
        result
    )

    # --- Pass 4: Value assignments after names: Andy =16, Betsy =12 ---
    def wrap_name_equals_num(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        name = m.group(1)
        eq_num = m.group(2)
        # Normalize spacing: "=16" → "= 16"
        eq_num = re.sub(r'=\s*', '= ', eq_num)
        return f'{name} ${eq_num}$'

    result = re.sub(
        r'([A-Z][a-z]+)\s+(=\s*\d+)',
        wrap_name_equals_num,
        result
    )

    # --- Pass 5: Simple variable = number: t = 3, x = 5, h = 2 ---
    # Single lowercase letter = number, in text context
    def wrap_var_eq_num(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        before = result[:m.start()]
        # Only wrap if preceded by word boundary (space, start, punctuation)
        if before and before[-1].isalpha():
            return m.group(0)
        return f'${m.group(1)}$'

    result = re.sub(
        r'(?<!\$)\b([a-z]\s*=\s*\d+(?:\.\d+)?)\b(?!\$)',
        wrap_var_eq_num,
        result
    )

    # --- Pass 6: Standalone single-letter variables in math context ---
    # Only wrap isolated single letters that are clearly math variables
    # This is tricky - skip for now to avoid false positives with articles "a", "I"

    # --- Pass 7: Bare coordinate expressions: (2, 31-4-24)=(2,3) ---
    def wrap_coord_eq(m):
        if is_in_math(result, m.start()):
            return m.group(0)
        return f'${m.group(0).strip()}$'

    result = re.sub(
        r'(?<!\$)\([\d,\s+\-]+\)\s*=\s*\([\d,\s+\-]+\)',
        wrap_coord_eq,
        result
    )

    # --- Pass 8: Merge bare math prefix into adjacent $...$  ---
    # e.g., "y-27=$\frac{3}{2}(x-18)$" → "$y-27=\frac{3}{2}(x-18)$"
    # e.g., "2+3=$\boxed{7}$" → "$2+3=\boxed{7}$"
    # CRITICAL: Only merge short, math-only prefixes. Never merge English words.
    # Prefix must: start with lowercase letter or digit, contain only math chars,
    # and end with an operator (=, +, -, etc.) immediately before $
    def merge_prefix(m):
        prefix = m.group(1)
        content = m.group(2)
        return f'${prefix}{content}$'

    result = re.sub(
        r'(?<!\$)(?<![a-zA-Z])([a-z0-9][a-z0-9+\-*/^_]*\s*=)\s*\$([^$]+)\$',
        merge_prefix,
        result
    )

    # --- Cleanup: merge adjacent $...$ $...$ into single $...$  ---
    # e.g., "$8$h" → should be "$8h$", or "$12$$x$" → "$12x$"
    result = re.sub(r'\$\s*\$', '', result)  # Remove empty $$ pairs from merging

    # Restore URL placeholders
    for key, url in url_placeholders.items():
        result = result.replace(key, url)

    # Preserve original indentation
    leading = len(line) - len(line.lstrip())
    if leading > 0:
        return line[:leading] + result
    return result


# ---------------------------------------------------------------------------
# Main conversion stages
# ---------------------------------------------------------------------------

def convert_wiki_math_tags(text):
    """Convert MediaWiki math tags to LaTeX delimiters.

    <math>...</math>  → $...$   (inline math)
    <imath>...</imath> → $...$   (inline math, alternative tag)
    <cmath>...</cmath> → $$...$$ (display math, may span multiple lines)
                         Ensures display math is on its own line(s).
    """
    # <cmath>...</cmath> → $$...$$ (display math, may span multiple lines)
    # Use re.DOTALL so .*? matches across newlines within <cmath> blocks
    def cmath_to_display(m):
        content = m.group(1).strip()
        return f'\n\n$${content}$$\n\n'
    text = re.sub(r'<cmath>(.*?)</cmath>', cmath_to_display, text,
                  flags=re.DOTALL | re.IGNORECASE)
    # <math>...</math> → $...$ (inline math)
    text = re.sub(r'<math>\s*', '$', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*</math>', '$', text, flags=re.IGNORECASE)
    # <imath>...</imath> → $...$ (inline math, alternative tag)
    text = re.sub(r'<imath>\s*', '$', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*</imath>', '$', text, flags=re.IGNORECASE)
    return text


def convert_existing_delimiters(text):
    """Convert \\( ... \\) to $...$ and \\[ ... \\] to $$...$$."""
    text = re.sub(r'\\\(\s*', '$', text)
    text = re.sub(r'\s*\\\)', '$', text)
    # \[ ... \] → $$...$$ (avoid matching wiki links [[...]])
    text = re.sub(r'(?<!\[)\\\[\s*', '$$', text)
    text = re.sub(r'\s*\\\](?!\])', '$$', text)
    return text


def handle_asymptote(text):
    """Detect and wrap Asymptote diagram code blocks."""
    lines = text.split('\n')
    result = []
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if is_asymptote_code(stripped):
            asy_lines = [stripped]
            j = i + 1
            # Only continue if the next lines also look like Asymptote code
            while j < len(lines):
                next_s = lines[j].strip()
                if is_asymptote_code(next_s):
                    asy_lines.append(next_s)
                    j += 1
                elif next_s and not next_s.startswith('==') and not next_s.startswith('\\begin'):
                    # Check if it's a continuation of code (contains code-like chars)
                    # but NOT text or LaTeX
                    if (any(c in next_s for c in '();') and
                        not has_latex_content(next_s) and
                        count_english_words(next_s) <= 1 and
                        not next_s.startswith('~')):
                        asy_lines.append(next_s)
                        j += 1
                    else:
                        break
                else:
                    break

            result.append('')
            result.append('> [Asymptote diagram - not rendered in Markdown]')
            result.append('')
            result.append('```asy')
            result.extend(asy_lines)
            result.append('```')
            result.append('')
            i = j
        else:
            result.append(line)
            i += 1

    return '\n'.join(result)


def handle_templates(text, problem_num):
    """Process MediaWiki templates."""
    def convert_duplicate(match):
        inner = match.group(1)
        links = re.findall(r'\[\[([^|\]]+)\|([^\]]+)\]\]', inner)
        if links:
            parts = []
            for page, display in links:
                url = f"https://artofproblemsolving.com/wiki/index.php/{page.replace(' ', '_')}"
                parts.append(f"[{display}]({url})")
            return f"> This problem is the same as {' and '.join(parts)}.\n"
        return ''

    text = re.sub(r'\{\{duplicate\|(.+?)\}\}', convert_duplicate, text, flags=re.DOTALL)
    text = re.sub(r'\{\{AMC10 box\|[^}]*\}\}', '', text)
    text = re.sub(r'\{\{AMC12 box\|[^}]*\}\}', '', text)
    text = re.sub(r'\{\{MAA Notice\}\}', '', text)
    text = re.sub(r'\{\{[^}]*\}\}', '', text)
    return text


def handle_wiki_links(text):
    """Convert MediaWiki links to Markdown links."""
    text = re.sub(r'\[\[User talk:[^|\]]+\|([^\]]+)\]\]', r'\1', text)
    text = re.sub(r'\[\[User:[^|\]]+\|([^\]]+)\]\]', r'\1', text)

    def convert_link(match):
        page = match.group(1)
        display = match.group(2)
        url = f"https://artofproblemsolving.com/wiki/index.php/{page.replace(' ', '_')}"
        return f"[{display}]({url})"

    text = re.sub(r'\[\[([^|\]]+)\|([^\]]+)\]\]', convert_link, text)

    def convert_simple_link(match):
        page = match.group(1)
        if page.startswith('Category:'):
            return ''
        url = f"https://artofproblemsolving.com/wiki/index.php/{page.replace(' ', '_')}"
        return f"[{page}]({url})"

    text = re.sub(r'\[\[([^\]]+)\]\]', convert_simple_link, text)
    return text


def convert_headers(text):
    """Convert MediaWiki section headers to Markdown headers."""
    # First, ensure headers embedded in long lines get their own lines
    # Match ==text== patterns not already at start of line
    def split_inline_headers(t):
        # Insert newline before ==header== if preceded by non-newline content
        t = re.sub(r'([^\n=])\s*(={2,4})(\s*[^=\n]+?\s*)(={2,4})\s*',
                   r'\1\n\2\3\4\n', t)
        return t

    for _ in range(5):  # Multiple passes for consecutive inline headers
        new_text = split_inline_headers(text)
        if new_text == text:
            break
        text = new_text

    # Now convert (allow trailing whitespace before end of line)
    text = re.sub(r'^====\s*(.+?)\s*====\s*$', r'#### \1', text, flags=re.MULTILINE)
    text = re.sub(r'^===\s*(.+?)\s*===\s*$', r'### \1', text, flags=re.MULTILINE)
    text = re.sub(r'^==\s*(.+?)\s*==\s*$', r'## \1', text, flags=re.MULTILINE)
    text = re.sub(r'^=\s*([^=].+?)\s*=\s*$', r'# \1', text, flags=re.MULTILINE)
    return text


def remove_see_also_and_footer(text):
    """Remove See Also section and everything after."""
    text = re.sub(r'\n##?\s*See Also\s*\n.*$', '\n', text, flags=re.DOTALL)
    return text


def merge_fragmented_math(line):
    """Merge fragmented $...$ blocks that should be one continuous expression.

    Fixes common fragmentation patterns:
      - $A$^digit → $A^digit$         (exponent after math)
      - digit^$A$ → $digit^A$         (exponent before math)
      - $A$op$B$  → $AopB$            (operator between blocks)
      - $A$$B$    → $AB$              (adjacent blocks)
      - ($A$)     → $(A)$             (parenthesized math)
      - $A$-digit$B$ → $A-digitB$     (coefficient gap)
    """
    if '$' not in line:
        return line

    result = line
    prev = None
    max_iter = 15
    while result != prev and max_iter > 0:
        prev = result
        max_iter -= 1

        # Rule 1: $A$^{B} → $A^{B}$
        result = re.sub(r'\$([^$]+)\$\^\{([^}]+)\}', r'$\1^{\2}$', result)

        # Rule 2: $A$^digit → $A^digit$
        result = re.sub(r'\$([^$]+)\$\^(\d+)', r'$\1^\2$', result)

        # Rule 3: $A$^letter → $A^letter$
        result = re.sub(r'\$([^$]+)\$\^([a-zA-Z])', r'$\1^\2$', result)

        # Rule 4: digit^$A$ → $digit^A$ or digitvar^$A$ → $digitvar^A$
        result = re.sub(r'(?<![a-zA-Z$])(\d+[a-zA-Z]?)\^\$([^$]+)\$', r'$\1^\2$', result)

        # Rule 5: var^$A$ → $var^A$ (like x^$\circ$)
        result = re.sub(r'(?<![a-zA-Z$])([a-zA-Z])\^\$([^$]+)\$', r'$\1^\2$', result)

        # Rule 6: $A$ operator $B$ → $A operator B$ where operator is +,-,*,/,=,<,>
        # Only merge if A and B look like math (not English text)
        def merge_operator(m):
            a, op, b = m.group(1), m.group(2), m.group(3)
            if contains_english_word(a) or contains_english_word(b):
                return m.group(0)
            return f'${a}{op}{b}$'
        result = re.sub(r'\$([^$]+)\$\s*([+\-*/=<>])\s*\$([^$]+)\$', merge_operator, result)

        # Rule 7: $A$[digits-and-math-chars]$B$ → merge if gap is math-like
        # Covers: $2x^2$-8$x$ or $A$+3$B$ etc.
        # IMPORTANT: Also verify that A and B look like math, not English text.
        def merge_math_gap(m):
            a_content = m.group(1)
            gap = m.group(2)
            b_content = m.group(3)
            # Gap must be math-only (no English words)
            if contains_english_word(gap):
                return m.group(0)
            # A and B must also look like math, not English
            if contains_english_word(a_content):
                return m.group(0)
            if contains_english_word(b_content):
                return m.group(0)
            return f'${a_content}{gap}{b_content}$'

        result = re.sub(
            r'\$([^$]+)\$([+\-*/=<>^()\d][a-zA-Z0-9+\-*/=<>^{}(),. ]{0,10}?)\$([^$]+)\$',
            merge_math_gap, result
        )

        # Rule 8: $A$$B$ → $AB$ (adjacent math blocks, no gap)
        # Only merge if both look like math
        def merge_adjacent(m):
            a, b = m.group(1), m.group(2)
            if contains_english_word(a) or contains_english_word(b):
                return m.group(0)
            return f'${a}{b}$'
        result = re.sub(r'\$([^$]+)\$\$([^$]+)\$', merge_adjacent, result)

        # Rule 9: ($A$) → $(A)$ — parenthesized single math block
        result = re.sub(r'\(\$([^$]+)\$\)', r'$(\1)$', result)

        # Rule 10: $A$(stuff)$B$ → $A(stuff)B$ where stuff has no English words
        # Also check A and B to prevent cross-block matching
        def merge_paren_gap(m):
            a_content = m.group(1)
            inner = m.group(2)
            b_content = m.group(3)
            if contains_english_word(inner):
                return m.group(0)
            if contains_english_word(a_content) or contains_english_word(b_content):
                return m.group(0)
            return f'${a_content}({inner}){b_content}$'

        result = re.sub(
            r'\$([^$]+)\$\(([^()]{1,30})\)\$([^$]+)\$',
            merge_paren_gap, result
        )

        # Rule 11: $A$(stuff) where stuff is math-like → $A(stuff)$
        # Also check A to prevent cross-block matching
        def merge_trailing_paren(m):
            a_content = m.group(1)
            inner = m.group(2)
            if contains_english_word(inner):
                return m.group(0)
            if contains_english_word(a_content):
                return m.group(0)
            # Check parens are balanced
            if inner.count('(') != inner.count(')'):
                return m.group(0)
            return f'${a_content}({inner})$'

        result = re.sub(
            r'\$([^$]+)\$\(([^()]{1,30})\)',
            merge_trailing_paren, result
        )

        # Rule 12: $A$ = value → $A = value$ (absorb trailing operator + value)
        # Covers: $4x^2$ = 0 → $4x^2 = 0$, $n$ + 1 → $n + 1$
        def merge_trailing_math(m):
            content = m.group(1)
            suffix = m.group(2)
            if contains_english_word(content):
                return m.group(0)  # Content is English — don't merge
            return f'${content}{suffix}$'

        result = re.sub(
            r'\$([^$]+)\$(\s*[=+\-*/^<>]\s*\d+(?:[.,]\d+)?(?:\s*[+\-*/]\s*\d+)*)',
            merge_trailing_math, result
        )

        # Rule 13: value op $A$ → $value op A$ (absorb leading coefficient/value)
        # Covers: 4$y^2$ → $4y^2$, -$x^2$ → $-x^2$
        def merge_leading_math(m):
            prefix = m.group(1)
            content = m.group(2)
            if contains_english_word(content):
                return m.group(0)
            return f'${prefix}{content}$'

        result = re.sub(
            r'(?<![a-zA-Z$])(\d+[a-zA-Z]?)\$([^$]+)\$',
            merge_leading_math, result
        )

    # Safety check: ensure $$ aren't broken (even number of $)
    # If odd, we likely broke something — return original
    dollar_count = result.count('$')
    # But $$ display math has even $ too, so just check basic parity
    if dollar_count % 2 != 0:
        return line

    return result


def fix_english_in_math(line):
    """Post-process to strip common English words from $...$ block boundaries.

    Fixes patterns like:
      $of x^3 + 2x^2$ → of $x^3 + 2x^2$
      $x^2 + 4 is a$ → $x^2 + 4$ is a
      $(p^2 + 4)(q^2 + 4)(r^2 + 4) as (p+2i)$ → $(p^2 + 4)(q^2 + 4)(r^2 + 4)$ as $(p+2i)$

    This is a safety net after wrapping and merging — catches any English words
    that slipped through the boundary detection heuristics.
    """
    if '$' not in line:
        return line

    # Build pattern for common English words (2-letter + common 3+ letter)
    STOP_WORDS = COMMON_ENGLISH_2LETTER | {
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'has',
        'her', 'was', 'one', 'our', 'out', 'its', 'let', 'say', 'get', 'set',
        'then', 'than', 'that', 'with', 'from', 'they', 'also', 'into',
        'since', 'gives', 'which', 'where', 'there', 'every', 'other',
    }

    result = line
    prev = None
    max_iter = 5

    while result != prev and max_iter > 0:
        prev = result
        max_iter -= 1

        # Strip leading English words from $...$:  $word rest$ → word $rest$
        # Use negative lookbehind/lookahead to avoid matching $$
        def strip_leading(m):
            content = m.group(1)
            # Match one or more English words at the start, followed by space
            lead_match = re.match(r'^([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+', content)
            if not lead_match:
                return m.group(0)
            # Check if ALL leading words are stop words
            leading_text = lead_match.group(1)
            words = leading_text.split()
            if not all(w.lower() in STOP_WORDS for w in words):
                return m.group(0)
            rest = content[lead_match.end():].strip()
            if not rest:
                return m.group(0)
            # Rest must still look like math (contain math-specific chars)
            if not re.search(r'[\\^_{}()\d]|[a-zA-Z][+\-*/=<>]|[+\-*/=<>][a-zA-Z]', rest):
                return m.group(0)
            return leading_text + ' $' + rest + '$'

        result = re.sub(r'(?<!\$)\$(?!\$)([^$]+)(?<!\$)\$(?!\$)', strip_leading, result)

        # Strip trailing English words from $...$:  $rest word$ → $rest$ word
        def strip_trailing(m):
            content = m.group(1)
            # Match one or more English words at the end, preceded by space
            trail_match = re.search(r'\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)$', content)
            if not trail_match:
                return m.group(0)
            trailing_text = trail_match.group(1)
            words = trailing_text.split()
            if not all(w.lower() in STOP_WORDS for w in words):
                return m.group(0)
            rest = content[:trail_match.start()].strip()
            if not rest:
                return m.group(0)
            # Rest must still look like math
            if not re.search(r'[\\^_{}()\d]|[a-zA-Z][+\-*/=<>]|[+\-*/=<>][a-zA-Z]', rest):
                return m.group(0)
            return '$' + rest + '$ ' + trailing_text

        result = re.sub(r'(?<!\$)\$(?!\$)([^$]+)(?<!\$)\$(?!\$)', strip_trailing, result)

    return result


def wrap_bare_caret_expression(line):
    """Wrap completely bare math expressions containing ^ in $...$.

    Handles polynomial expressions like:
      2x^2-8x+3x-12=0 → $2x^2-8x+3x-12=0$
      x^n + ... + x + 1 = 0 → $x^n + ... + x + 1 = 0$
      P(x) = 2x^4-3x^2 → $P(x) = 2x^4-3x^2$
    """
    if '^' not in line:
        return line

    # Skip non-content lines
    stripped = line.strip()
    if not stripped or stripped.startswith('#') or stripped.startswith('http') or stripped.startswith('```'):
        return line
    if stripped.startswith('*~') or stripped.startswith('>'):
        return line

    # Quick check: any bare ^ outside $...$?
    has_bare = False
    dollar_count = 0
    for c in stripped:
        if c == '$':
            dollar_count += 1
        elif c == '^' and dollar_count % 2 == 0:
            has_bare = True
            break
    if not has_bare:
        return line

    # Strategy: find each bare ^, identify the surrounding math expression,
    # wrap it. Use character-level scanning for precision.
    result = list(stripped)
    n = len(result)

    # Find all bare ^ positions
    bare_positions = []
    dollar_count = 0
    for i in range(n):
        if result[i] == '$':
            dollar_count += 1
        elif result[i] == '^' and dollar_count % 2 == 0:
            bare_positions.append(i)

    if not bare_positions:
        return line

    # For each bare ^, find expression boundaries
    # "Math chars" that extend an expression: digits, letters, ^, {, }, (, ), +, -, *, /, =, ., ','
    MATH_CHARS = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789^{}()+-*/=.,_')
    MATH_WITH_SPACE = MATH_CHARS | {' '}

    regions = []
    for pos in bare_positions:
        # Extend left
        left = pos
        while left > 0:
            c = stripped[left - 1]
            if c == '$':
                break  # Don't cross math boundaries
            if c in MATH_WITH_SPACE:
                # If space, check if preceding text is an English word
                if c == ' ':
                    # Look further left for word boundary
                    j = left - 2
                    while j >= 0 and stripped[j].isalpha():
                        j -= 1
                    word = stripped[j+1:left-1]
                    if word.isalpha() and word.islower() and (
                        len(word) >= 3 or word in COMMON_ENGLISH_2LETTER
                    ):
                        # This is an English word — stop here (keep the space out)
                        break
                left -= 1
            else:
                break

        # Extend right
        right = pos + 1
        while right < n:
            c = stripped[right]
            if c == '$':
                break
            if c in MATH_WITH_SPACE:
                if c == ' ':
                    j = right + 1
                    while j < n and stripped[j].isalpha():
                        j += 1
                    word = stripped[right+1:j]
                    if word.isalpha() and word.islower() and (
                        len(word) >= 3 or word in COMMON_ENGLISH_2LETTER
                    ):
                        break
                right += 1
            else:
                break

        # Trim leading/trailing spaces
        while left < pos and stripped[left] == ' ':
            left += 1
        while right > pos + 1 and stripped[right-1] == ' ':
            right -= 1

        regions.append((left, right))

    # Merge overlapping regions
    merged = []
    for start, end in sorted(regions):
        if merged and start <= merged[-1][1] + 1:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))

    # Apply wrapping (right to left to preserve positions)
    result_str = stripped
    for start, end in reversed(merged):
        expr = result_str[start:end]
        # Skip if already wrapped or too short
        if not expr or expr.startswith('$') or expr.endswith('$'):
            continue
        # Verify the expression actually contains ^ and looks like math
        if '^' not in expr:
            continue
        if contains_english_word(expr):
            continue  # Contains English words = likely not pure math
        result_str = result_str[:start] + '$' + expr + '$' + result_str[end:]

    # Preserve original indentation
    if line != stripped:
        indent = line[:len(line) - len(line.lstrip())]
        return indent + result_str
    return result_str


def process_all_latex(text):
    """Process all LaTeX: environments, display math, inline math."""
    lines = text.split('\n')
    result = []
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip empty lines, already-wrapped, headers, URLs, code blocks
        if not stripped:
            result.append(line)
            i += 1
            continue

        if stripped.startswith('$') or stripped.startswith('```') or stripped.startswith('>'):
            result.append(line)
            i += 1
            continue

        if stripped.startswith('#'):
            result.append(line)
            i += 1
            continue

        if stripped.startswith('http://') or stripped.startswith('https://'):
            result.append(line)
            i += 1
            continue

        # Check for \begin{...} environment (line starts with \begin or has leading whitespace)
        env_match = re.match(r'^(\s*)\\begin\{(\w+\*?)\}', line)
        if env_match:
            env_name = env_match.group(2)

            if env_name in LATEX_ENVS or env_name.rstrip('*') in LATEX_ENVS:
                end_pattern = f'\\end{{{env_name}}}'

                if end_pattern in line:
                    # Single-line environment — use multi-line $$ for renderer compat
                    result.append('')
                    result.append('$$')
                    result.append(stripped)
                    result.append('$$')
                    result.append('')
                    i += 1
                    continue
                else:
                    # Multi-line environment
                    env_lines = [lines[i].strip()]
                    j = i + 1
                    while j < len(lines):
                        env_lines.append(lines[j].strip())
                        if end_pattern in lines[j]:
                            break
                        j += 1

                    result.append('')
                    result.append('$$')
                    for el in env_lines:
                        result.append(el)
                    result.append('$$')
                    result.append('')

                    i = j + 1
                    continue

        # Check for complete \begin{...}...\end{...} on one line (possibly preceded by \renewcommand etc.)
        if '\\begin{' in stripped and '\\end{' in stripped:
            before_begin = stripped[:stripped.index('\\begin{')].strip()
            if not before_begin or not count_english_words(before_begin):
                result.append('')
                result.append('$$')
                result.append(stripped)
                result.append('$$')
                result.append('')
                i += 1
                continue

        # Check for standalone \begin{...} that doesn't start the line (inline env start)
        # E.g.: " \mathbf{v}_0 = 10 \begin{pmatrix} ..."
        if '\\begin{' in stripped and '\\end{' not in stripped:
            # Find which environment
            env_m = re.search(r'\\begin\{(\w+\*?)\}', stripped)
            if env_m:
                env_name = env_m.group(1)
                if env_name in LATEX_ENVS or env_name.rstrip('*') in LATEX_ENVS:
                    end_pattern = f'\\end{{{env_name}}}'
                    # Collect until \end{...}
                    env_lines = [stripped]
                    j = i + 1
                    while j < len(lines):
                        env_lines.append(lines[j].strip())
                        if end_pattern in lines[j]:
                            break
                        j += 1

                    combined = '\n'.join(env_lines)
                    if count_english_words(combined) <= 2:
                        # Mostly math
                        result.append('')
                        result.append('$$')
                        for el in env_lines:
                            result.append(el)
                        result.append('$$')
                        result.append('')
                        i = j + 1
                        continue

        # Check if this is a display math line
        if is_display_math_line(stripped):
            math_lines = [stripped]
            j = i + 1
            while j < len(lines):
                next_stripped = lines[j].strip()
                if not next_stripped:
                    break
                if (re.match(r'^\\(Rightarrow|implies|Leftarrow|therefore|because|iff)\b', next_stripped) or
                    (is_display_math_line(next_stripped) and
                     not re.match(r'^\\textbf\{', next_stripped) and
                     not next_stripped.startswith('#'))):
                    if re.match(r'^\\textbf\{', math_lines[-1]):
                        break
                    math_lines.append(next_stripped)
                    j += 1
                else:
                    break

            # Determine wrapping style
            if len(math_lines) == 1:
                expr = math_lines[0]
                # Answer choices → inline $...$
                if re.match(r'^\\textbf\{', expr):
                    result.append(f'${expr}$')
                elif len(expr) < 80:
                    result.append(f'$${expr}$$')
                else:
                    result.append('')
                    result.append(f'$${expr}$$')
                    result.append('')
            else:
                result.append('')
                result.append('$$')
                for ml in math_lines:
                    result.append(ml)
                result.append('$$')
                result.append('')

            i = j
            continue

        # Mixed text + LaTeX → wrap inline
        if has_latex_content(stripped):
            processed = wrap_inline_latex_in_line(line)
            # Also apply bare math wrapping for any remaining unwrapped math
            if has_bare_math(processed):
                processed = wrap_bare_math_in_line(processed)
            # Merge fragmented math blocks
            processed = merge_fragmented_math(processed)
            # Catch remaining bare caret expressions
            processed = wrap_bare_caret_expression(processed)
            # Final merge pass after caret wrapping
            processed = merge_fragmented_math(processed)
            # Strip English words from math boundaries
            processed = fix_english_in_math(processed)
            result.append(processed)
        elif has_bare_math(stripped):
            # Line has bare math but no LaTeX commands
            processed = wrap_bare_math_in_line(line)
            processed = merge_fragmented_math(processed)
            processed = wrap_bare_caret_expression(processed)
            processed = merge_fragmented_math(processed)
            # Strip English words from math boundaries
            processed = fix_english_in_math(processed)
            result.append(processed)
        else:
            # Even lines without detected bare math might have bare ^ from source
            processed = wrap_bare_caret_expression(line)
            if processed != line:
                processed = merge_fragmented_math(processed)
                processed = fix_english_in_math(processed)
            result.append(processed)

        i += 1

    return '\n'.join(result)


def format_author_credits(text):
    """Format author credit lines (~username)."""
    lines = text.split('\n')
    result = []
    credit_block = []

    for line in lines:
        stripped = line.strip()

        if re.match(r'^[~]\s*\w', stripped) and len(stripped) < 200:
            credit_block.append(stripped)
            continue

        # '-' prefix credits (like "-apex304") but not list items
        if re.match(r'^-[a-zA-Z]', stripped) and len(stripped) < 100:
            credit_block.append(stripped)
            continue

        if credit_block:
            for credit in credit_block:
                credit = credit.lstrip('~- ').strip()
                if credit:
                    result.append(f'*~{credit}*')
            credit_block = []

        result.append(line)

    if credit_block:
        for credit in credit_block:
            credit = credit.lstrip('~- ').strip()
            if credit:
                result.append(f'*~{credit}*')

    return '\n'.join(result)


def final_cleanup(text):
    """Final cleanup pass."""
    # Remove excessive blank lines (more than 2 consecutive)
    text = re.sub(r'\n{4,}', '\n\n\n', text)

    # Remove trailing whitespace
    lines = text.split('\n')
    lines = [line.rstrip() for line in lines]
    text = '\n'.join(lines)

    # Ensure file ends with single newline
    text = text.rstrip('\n') + '\n'

    # Fix quadruple dollar signs → double
    text = text.replace('$$$$', '$$')

    # Remove truly empty inline math pairs ($ $ or $  $) but NOT $$
    # We need to be careful not to break display math $$...$$
    # Only remove $ followed by whitespace-only then $ (inline empty math)
    text = re.sub(r'\$[ \t]+\$', '', text)

    # Convert wiki-style bold/italic
    text = re.sub(r"'''(.+?)'''", r'**\1**', text)
    text = re.sub(r"''(.+?)''", r'*\1*', text)

    # Convert MediaWiki bullet points
    text = re.sub(r'^\*\s+', '- ', text, flags=re.MULTILINE)

    # DO NOT convert # at start of line — it's now a Markdown header, not a MediaWiki list.
    # MediaWiki numbered lists (#) should be handled before header conversion if needed.

    return text


# ---------------------------------------------------------------------------
# Main conversion function
# ---------------------------------------------------------------------------

def convert(source_text, problem_num, contest_name="2025 AMC 12A"):
    """Convert AoPS MediaWiki raw source to Markdown + LaTeX.

    Args:
        source_text: Raw MediaWiki source text
        problem_num: Problem number (1-25)
        contest_name: Contest name for header, e.g. "2002 AMC 12A"
    """
    text = remove_header(source_text)
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # Convert MediaWiki math tags (<math>, <imath>, <cmath>) to $ / $$
    text = convert_wiki_math_tags(text)

    # Convert existing delimiters (\( \) → $ $, etc.)
    text = convert_existing_delimiters(text)

    # Handle Asymptote diagrams FIRST (before LaTeX processing)
    text = handle_asymptote(text)

    # Handle wiki templates
    text = handle_templates(text, problem_num)

    # Handle wiki links
    text = handle_wiki_links(text)

    # Remove category tags
    text = re.sub(r'\[\[Category:[^\]]*\]\]', '', text)

    # Convert MediaWiki numbered lists BEFORE header conversion
    # (MediaWiki uses # for numbered lists, but after conversion # means Markdown header)
    text = re.sub(r'^#\s+(?!=)', '1. ', text, flags=re.MULTILINE)

    # Convert section headers
    text = convert_headers(text)

    # Remove See Also and footer
    text = remove_see_also_and_footer(text)

    # Process LaTeX (core logic)
    text = process_all_latex(text)

    # Format author credits
    text = format_author_credits(text)

    # Add document header
    header = f"# {contest_name} Problem {problem_num}\n\n"
    text = header + text.strip() + '\n'

    # Final cleanup
    text = final_cleanup(text)

    return text


# ---------------------------------------------------------------------------
# Entry point — batch conversion for flat-file repos
# ---------------------------------------------------------------------------

def repo_name_to_contest(repo_name):
    """Convert repo directory name to contest display name.

    E.g. '2002_AMC_12A_Problems' → '2002 AMC 12A'
         '2025_AMC_12B_Problems' → '2025 AMC 12B'
    """
    parts = repo_name.replace('_Problems', '').split('_')
    return ' '.join(parts)


def convert_single_repo(repo_dir, contest_name=None):
    """Convert all Problem_XX.raw.txt files in a repo directory.

    Args:
        repo_dir: Path to repo directory containing Problem_XX.raw.txt files
        contest_name: Contest name for headers; auto-derived from dir name if None

    Returns:
        (success_count, error_count, skip_count)
    """
    repo_name = os.path.basename(repo_dir)
    if contest_name is None:
        contest_name = repo_name_to_contest(repo_name)

    success_count = 0
    error_count = 0
    skip_count = 0

    for i in range(1, 26):
        source_file = os.path.join(repo_dir, f'Problem_{i:02d}.raw.txt')
        output_file = os.path.join(repo_dir, f'Problem_{i:02d}.md')

        if not os.path.exists(source_file):
            skip_count += 1
            continue

        try:
            with open(source_file, 'r', encoding='utf-8') as f:
                source = f.read()

            result = convert(source, i, contest_name)

            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(result)

            success_count += 1

        except Exception as e:
            print(f"    [ERR] {repo_name}/Problem_{i:02d}: {e}")
            error_count += 1
            import traceback
            traceback.print_exc()

    return success_count, error_count, skip_count


def main():
    import glob
    import json

    base_dir = sys.argv[1] if len(sys.argv) > 1 else '.'
    base_dir = os.path.abspath(base_dir)

    # Find all repo directories (sorted)
    repo_dirs = sorted([
        d for d in glob.glob(os.path.join(base_dir, '*_AMC_12*_Problems'))
        if os.path.isdir(d)
    ])

    if not repo_dirs:
        # Maybe we're run inside a single repo
        raw_files = glob.glob(os.path.join(base_dir, 'Problem_*.raw.txt'))
        if raw_files:
            repo_dirs = [base_dir]
        else:
            print(f"No AMC 12 repos found in {base_dir}")
            sys.exit(1)

    total_success = 0
    total_errors = 0
    total_skip = 0
    results = {}

    print(f"Converting {len(repo_dirs)} repo(s)...\n")

    for repo_dir in repo_dirs:
        repo_name = os.path.basename(repo_dir)
        contest_name = repo_name_to_contest(repo_name)

        s, e, sk = convert_single_repo(repo_dir, contest_name)
        total_success += s
        total_errors += e
        total_skip += sk

        status = "OK" if e == 0 else "ERR"
        print(f"  [{status}] {repo_name}: {s} converted, {e} errors, {sk} skipped")
        results[repo_name] = {"success": s, "errors": e, "skipped": sk}

    print(f"\n{'='*60}")
    print(f"Total: {total_success} converted, {total_errors} errors, {total_skip} skipped")
    print(f"Repos: {len(repo_dirs)}")

    # Write summary JSON for viewer
    summary_file = os.path.join(base_dir, 'conversion_summary.json')
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump({
            "total_repos": len(repo_dirs),
            "total_success": total_success,
            "total_errors": total_errors,
            "total_skipped": total_skip,
            "repos": results
        }, f, indent=2)
    print(f"\nSummary written to {summary_file}")


if __name__ == '__main__':
    main()
