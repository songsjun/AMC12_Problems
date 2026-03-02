# 2017 AMC 12B Problem 7

## Problem
The functions $\sin(x)$ and $\cos(x)$ are periodic with least period $2\pi.$ What is the least period of the function $\cos(\sin(x))$?

$\textbf{(A)}\ \frac{\pi}{2}\qquad\textbf{(B)}\ \pi\qquad\textbf{(C)}\ 2\pi \qquad\textbf{(D)}\ 4\pi \qquad\textbf{(E)}  The function is not periodic.$
## Solution 1
Start by noting that $\cos(-x)=\cos(x).$ Then realize that under this function, the negative sine values yield the same as their positive value, so take the absolute value of the sine function to get the new period. This has period $\pi,$ so the answer is $\boxed{(B)}.$
## Solution 2 (Brute Force)
First, we can eliminate D and E, as both $\sin$ and $\cos$ are periodic with period $2\pi,$ as stated. Therefore the nested function must be periodic with period p $\le 2\pi.$ Next, we know $\sin$ and $\cos$ have ranges of [-1, 1] with turning points/zeroes at values of x in the set S = $\{0, \frac{\pi}{2}, \pi, \frac{3\pi}{2}\}$. These 4 values are easy to compute and should convey the relevant information about our function, so let's consider these.

First compute the values of $\sin(x)$ to be (0, 1, 0, -1) over the set S. Therefore, the values of $\cos(\sin(x))$ are (1, $\cos(1), 1, \cos(-1)).$ You may notice that one appears twice: at the values $x=0$ and $x=\pi,$ and guess that the period is $\pi.$ Alternatively, you can use the fact that $\cos(-x)=\cos(x)$ as in solution 1, which can be shown by considering the unit circle definition of cosine. You then get that the values of $\cos(\sin(x))$ are (1, $\cos(1), 1, \cos(1)),$ which is more obviously periodic with period $\pi,$ therefore the answer is $\boxed{(B)}.$

NOTE: This method is not strict proof that the function has period $\pi$ as we only consider 4 values in the interval.

*~rawr3507*
## See Also
