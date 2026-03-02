# 2013 AMC 12B Problem 20

## Problem
For $135^\circ <$ x < $180^\circ,$ points P=($\cos$ x, $\cos^2 x), Q=(\cot$ x, $\cot^2 x), R=(\sin$ x, $\sin^2$ x) and S =($\tan$ x, $\tan^2$ x) are the vertices of a trapezoid. What is $\sin(2x)$?

$\textbf{(A)} \ 2-2\sqrt{2}\qquad\textbf{(B)}\ 3\sqrt{3}-6\qquad\textbf{(C)}\ 3\sqrt{2}-5\qquad\textbf{(D)}\ -\frac{3}{4}\qquad\textbf{(E)}\ 1-\sqrt{3}$
## Solution
Let f,g,h, and j be $\cos{x}, \cot{x}, \sin{x},$ and $\tan{x},$ respectively. Then, we have four points $(f,f^2),(g,g^2),(h,h^2),(j,j^2),$ and a pair of lines each connecting two points must be parallel (as we are dealing with a trapezoid). WLOG, take the line connecting the first two points and the line connecting the last two points to be parallel, so that $\frac{g^2-f^2}{g-f} = \frac{j^2-h^2}{j-h},$ or g+f = j+h.

Now, we must find how to match up $\sin, \cos, \tan, \cot$ to f,g,h,j so that the above equation has a solution. On the interval $135^\circ <$ x < $180^\circ,$ we have $\cot$ x <-1<$\cos$ x<0<$\sin$ x, and $\cot$ x <-1<$\tan$ x<0<$\sin$ x so the sum of the largest and the smallest is equal to the sum of the other two, namely, $\sinx+\cot$ x = $\cosx+\tan$ x.

Now, we perform some algebraic manipulation to find $\sin (2x)$:


$$\sin x+\cot x = \cos x+\tan x \\ \sin x - \cos x = \tan x - \cot x = (\sin x - \cos x) (\sin x + \cos x) / (\sin x \cos x) \\ \sin x \cos x = \sin x + \cos x \\ (\sin x \cos x)^2 = (\sin x + \cos x)^2 \\ (\sin x \cos x)^2 = \sin^2 x + 2\sin x \cos x + \cos^2 x \\ (\sin x \cos x)^2 - 2\sin x \cos x - 1 =0$$


Solve the quadratic to find $\sin$ x $\cosx =\frac{2 - 2\sqrt{2}}{2},$ so that $\sin(2x) = 2 \sin$ x $\cosx =\boxed{\textbf{(A)} \ 2 - 2\sqrt{2}}.$
## See also
