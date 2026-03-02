# 2004 AMC 12A Problem 21

## Problem
If $\sum_{n = 0}^{\infty}{\cos^{2n}}\theta = 5,$ what is the value of $\cos{2\theta}$?


$$\text {(A)} \frac15 \qquad \text {(B)} \frac25 \qquad \text {(C)} \frac {\sqrt5}{5}\qquad \text {(D)} \frac35 \qquad \text {(E)}\frac45$$

## Solutions
### Solution 1
This is an infinite [geometric series](https://artofproblemsolving.com/wiki/index.php/geometric_series), which sums to $\frac{\cos^0 \theta}{1 - \cos^2 \theta} = 5 \Longrightarrow 1 = 5 - 5\cos^2 \theta \Longrightarrow \cos^2 \theta = \frac{4}{5}.$ Using the formula $\cos 2\theta = 2\cos^2 \theta - 1 = 2\left(\frac 45\right) - 1 = \frac 35 \Rightarrow \mathrm{(D)}.$
#### Solution 1a
We can more directly solve this with superficially less work. Again, applying the formula for an infinite geometric series,


$$\sum_{i=0}^{\infty}\cos^{2i}\theta=\dfrac1{1-\cos^2\theta}=\dfrac1{\sin^2\theta}=5.$$


Thus, $\sin^2\theta=\dfrac15,$ so $\cos(2\theta)=1-2\sin^2\theta=1-\dfrac25=\dfrac35. QED.$

*~Technodoggo*
### Solution 2

$$\sum_{n = 0}^{\infty}{\cos^{2n}}\theta = \cos^{0}\theta + \cos^{2}\theta + \cos^{4}\theta + ... = 5$$


Multiply both sides by $\cos^{2}\theta$ to get:

$$\cos^{2}\theta + \cos^{4}\theta + \cos^{6}\theta + ... = 5*\cos^{2}\theta$$

Subtracting the two equations, we get:

$$\cos^{0}\theta=5-5*\cos^{2}\theta$$

After simplification, we get $cos^{2}$$\theta=\frac{4}{5}.$ Using the formula $\cos 2\theta = 2\cos^2 \theta - 1 = 2\left(\frac 45\right) - 1 = \frac 35 \Rightarrow \mathrm{(D)}.$
## See also
