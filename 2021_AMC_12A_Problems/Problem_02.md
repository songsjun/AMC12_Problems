# 2021 AMC 12A Problem 2

## Problem
Under what conditions is $\sqrt{a^2+b^2}=a+b$ true, where a and b are real numbers?

$\textbf{(A) } It is never true.$

$\textbf{(B) } It is true if and only if ab=0.$

$\textbf{(C) } It is true if and only if a+b\ge 0.$

$\textbf{(D) } It is true if and only if ab=0 and a+b\ge 0.$

$\textbf{(E) } It is always true.$
## Solution 1 (Algebra)
One can square both sides to get $a^{2}+b^{2}=a^{2}+2ab+b^{2}$. Then, 0=2ab$\implies$ ab=0. Also, it is clear that both sides of the equation must be nonnegative. The answer is $\boxed{\textbf{(D)}}.$

*~Jhawk0224*
## Solution 2 (Algebra)
Complete the square of the left side by rewriting the radical to be $\sqrt{(a+b)^{2}-2ab}.$
From there it is evident for the square root of the left to be equal to the right, ab must be equal to zero.
Also, we know that the equivalency of square root values only holds true for nonnegative values of a+b, making the correct answer $\boxed{\textbf{(D)}}.$

*~AnkitAmc*
## Solution 3 (Process of Elimination)
The left side of the original equation is the **arithmetic square root**, which is always nonnegative. So, we need $a+b\ge 0,$ which refutes $\textbf{(B)}$ and $\textbf{(E)}.$ Next, picking (a,b)=(0,0) refutes $\textbf{(A)},$ and picking (a,b)=(1,2) refutes $\textbf{(C)}.$ By POE (Process of Elimination), the answer is $\boxed{\textbf{(D)}}.$

*~MRENTHUSIASM*
## Solution 4 (Graphing)
If we graph $\sqrt{x^2+y^2}=x+y,$ then we get the union of:

*positive x-axis

*positive y-axis

*origin

Therefore, the answer is $\boxed{\textbf{(D)}}.$

The graph of $\sqrt{x^2+y^2}=x+y$ is shown below.

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(200); int xMin = -5; int xMax $= 5$; int yMin = -5; int yMax $= 5$; draw((xMin,0)--(xMax,0),black+linewidth(1.5),EndArrow(5)); draw((0,yMin)--(0,yMax),black+linewidth(1.5),EndArrow(5)); label("$x$",(xMax,0),(2,0)); label("$y$",(0,yMax),(0,2)); draw((xMax,0)--(0,0)--(0,yMax),red+linewidth(1.5));
```

*~MRENTHUSIASM (credit given to TheAMCHub)*
## Video Solution (Quick and Easy)
https://youtu.be/WCrLIqVR0kc

*~Education, the Study of Everything*
## Video Solution by Aaron He
https://www.youtube.com/watch?v=xTGDKBthWsw&t=40
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=P5al76DxyHY
## Video Solution by OmegaLearn (Using Logic and Analyzing Answer Choices)
https://youtu.be/Yp2NfDk_D-g

*~pi_is_3.14*
## Video Solution by TheBeautyofMath
https://youtu.be/rEWS75W0Q54?t=71

*~IceMatrix*
## See also
