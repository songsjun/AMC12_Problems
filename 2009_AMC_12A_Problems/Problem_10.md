# 2009 AMC 12A Problem 10

> This problem is the same as [2009 AMC 12A #10](https://artofproblemsolving.com/wiki/index.php/2009_AMC_12A_Problems) and [2009 AMC 10A #12](https://artofproblemsolving.com/wiki/index.php/2009_AMC_10A_Problems).
## Problem
In quadrilateral ABCD, AB = 5, BC = 17, CD = 5, DA = 9, and BD is an integer. What is BD?

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(4mm); defaultpen(linewidth(.8pt)+fontsize(8pt)); dotfactor=4; pair C=(0,0), B=(17,0); pair D=intersectionpoints(Circle(C,5),Circle(B,13))[0]; pair A=intersectionpoints(Circle(D,9),Circle(B,5))[0]; pair[] dotted={A,B,C,D}; draw(D--A--B--C--D--B); dot(dotted); label("$D$",D,NW); label("$C$",C,W); label("$B$",B,E); label("$A$",A,NE); $\textbf{(A)}$\ 11 $\qquad \textbf{(B)}$\ 12 $\qquad \textbf{(C)}$\ 13 $\qquad \textbf{(D)}$\ 14 $\qquad \textbf{(E)}$\ 15
```
## Solution
By the [triangle inequality](https://artofproblemsolving.com/wiki/index.php/triangle_inequality) we have BD < DA + AB = $9 + 5 = 14$, and also BD + CD > BC, hence BD > BC - CD = $17 - 5 = 12$.

We get that 12 < BD < 14, and as we know that BD is an integer, we must have BD=$\boxed{13}.$
## See Also
