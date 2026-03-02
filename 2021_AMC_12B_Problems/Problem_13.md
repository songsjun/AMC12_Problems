# 2021 AMC 12B Problem 13

## Problem
How many values of $\theta$ in the interval 0<$\theta\le 2\pi$ satisfy $1-3\sin\theta+5\cos3\theta = 0$?
$\textbf{(A) }2 \qquad \textbf{(B) }4 \qquad \textbf{(C) }5\qquad \textbf{(D) }6 \qquad \textbf{(E) }8$
## Solution
We rearrange to get $5\cos3\theta = 3\sin\theta-1.$
We can graph two functions in this case: $y=5\cos{3x}$ and $y=3\sin{x} -1$ .
Using transformation of functions, we know that $5\cos{3x}$ is just a cosine function with amplitude 5 and period $\frac{2\pi}{3}.$ Similarly, $3\sin{x} -1$  is just a sine function with amplitude 3 and shifted 1 unit downward:

> [Asymptote diagram - not rendered in Markdown]

```asy
import graph; size(400,200,IgnoreAspect); real Sin(real t) {return 3*sin(t) - 1;} real Cos(real t) {return 5*cos(3*t);} draw(graph(Sin,0, 2pi),red,"$\sin{x} -1 $"); draw(graph(Cos,0, 2pi),blue,"$\cos{3x}$"); xaxis("$x$",BottomTop,LeftTicks); yaxis("$y$",LeftRight,RightTicks(trailingzero)); add(legend(),point(E),20E,UnFill);
```

So, we have $\boxed{\textbf{(D) }6}$ solutions.

*~Jamess2022 (burntTacos)*
## Video Solution (Just 1 min!)
https://youtu.be/2wYcntg1mCc

_~Education, the Study of Everything_
## Video Solution (quick, no graphing)
https://youtu.be/YTn5YPQt6IY
*~MathProblemSolvingSkills.com*
## Video Solution by OmegaLearn (Using Sine and Cosine Graph)
https://youtu.be/toBOpc6vS6s

*~pi_is_3.14*
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=p4iCAZRUESs
## See Also
