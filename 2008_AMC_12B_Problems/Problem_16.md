# 2008 AMC 12B Problem 16

## Problem
A rectangular floor measures a by b feet, where a and b are positive integers with b > a. An artist paints a rectangle on the floor with the sides of the rectangle parallel to the sides of the floor. The unpainted part of the floor forms a border of width 1 foot around the painted rectangle and occupies half of the area of the entire floor. How many possibilities are there for the ordered pair (a,b)?

$\textbf{(A)}\ 1\qquad\textbf{(B)}\ 2\qquad\textbf{(C)}\ 3\qquad\textbf{(D)}\ 4\qquad\textbf{(E)}\ 5$
## Solution
$A_{outer}$=ab

$A_{inner}$=(a-2)(b-2)

$A_{outer}$=$2A_{inner}$

$$ab=2(a-2)(b-2)=2ab-4a-4b+8$$

$$0=ab-4a-4b+8$$

By Simon's Favorite Factoring Trick:

$$8=ab-4a-4b+16=(a-4)(b-4)$$

Since $8=1\times8$ and $8=2\times4$ are the only positive factorings of 8.

(a,b)=(5,12) or (a,b)=(6,8) yielding $\Rightarrow\textbf{(B)} 2$ solutions. Notice that because b>a, the reversed pairs are invalid.
## See Also
