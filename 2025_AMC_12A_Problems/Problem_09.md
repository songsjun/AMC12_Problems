# 2025 AMC 12A Problem 9

## Problem
Let w be the complex number 2+i, where $i=\sqrt{-1}.$ What real number r has the property that r, w, and $w^2$ are three collinear points in the complex plane?

$\textbf{(A)}~\frac34\qquad\textbf{(B)}~1\qquad\textbf{(C)}~\frac75\qquad\textbf{(D)}~\frac32\qquad\textbf{(E)}~\frac53$
## Solution 1 (Rectangular Form)
We begin by calculating $w^2$:
$$w^2 = (2+i)^2 = 4+4i-1 = 3+4i.$$
Values on the complex plane can easily be represented as points on the Cartesian plane, so we go ahead and do that so we are in a more familiar place.
Translating onto the Cartesian plane, we have the points (2,1) and (3,4). The slope of the line passing through these points is $\frac{4-1}{3-2} = 3,$ so the equation of this line is

$$
\begin{align*} y &= 3(x-2)+1 \\ y &= 3x-5. \end{align*}
$$

We want the real number that passes through this line, which is equivalent to the x-intercept. This occurs when $y=0$, so the x-intercept of this line is $x=\boxed{\textbf{(E)}~\frac53}.$

*~lprado (minor edits ~Logibyte)*
## Solution 2 (Polar Form)
Recall that the slope of a line is $m=\tan\phi,$ where $\phi$ is the angle formed by the line and the positive x-axis.

Note that |w|=$\sqrt{2^2+1^2}=\sqrt{5}.$ In polar coordinates, let $w=\sqrt{5}$\operatorname{cis}$\theta.$ It follows that $\tan\theta=\frac12.$

By De Moivre's Theorem, we have $w^2=5$\operatorname{cis}($2\theta),$ from which $\tan(2\theta)=\frac{2\tan\theta}{1-\tan^2\theta}=\frac{4}{3}.$

We obtain the following diagram:

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(200); int xMin = -2; int xMax $= 5$; int yMin = -2; int yMax $= 5$; //Draws the horizontal gridlines void horizontalLines() { for (int i = yMin+1; i < yMax; ++i) { draw((xMin,i)--(xMax,i), mediumgray+linewidth(0.4)); } } //Draws the vertical gridlines void verticalLines() { for (int i = xMin+1; i < xMax; ++i) { draw((i,yMin)--(i,yMax), mediumgray+linewidth(0.4)); } } horizontalLines(); verticalLines(); draw((xMin,0)--(xMax,0),black+linewidth(1.5),EndArrow(5)); draw((0,yMin)--(0,yMax),black+linewidth(1.5),EndArrow(5)); label("Re",(xMax,0),(2,0)); label("Im",(0,yMax),(0,2)); pair W1, W2, R; W1 = (2,1); W2 = (3,4); R = (5/3,0); label("$w=2+i$", W1, 2*dir(W1)); label("$w^2$", W2, 2*dir(W2)); label("$r$", R, 2*dir(R-W2)); label("$\theta$", origin, 6*dir(14)); label("$\theta$", origin, 6*dir(40)); draw(W1--origin--W2); draw(W2--R,dashed); dot(W1^^W2^^R, linewidth(4));
```

Since $\left$|$w^2\right$|=5, we have $w^2=3+4i$ by a 3-4-5 triangle. The complex numbers w and $w^2$ correspond to the points (2,1) and (3,4), respectively, and r corresponds to the x-intercept of this line. In slope-intercept form, the line containing these two points is y=$3x-5$. Therefore, the x-intercept is $r=\boxed{\textbf{(E)}~\frac53}.$

*~MRENTHUSIASM*
## Video Solution (Quick and Intuitive!)
https://youtu.be/k-HoA8XEHl4

*~Education, the Study of Everything*
## Video Solution by Power Solve
https://www.youtube.com/watch?v=Oy5hEE1fmJU
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
