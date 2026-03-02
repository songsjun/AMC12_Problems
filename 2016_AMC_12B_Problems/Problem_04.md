# 2016 AMC 12B Problem 4

## Problem
The ratio of the measures of two acute angles is 5:4, and the complement of one of these two angles is twice as large as the complement of the other. What is the sum of the degree measures of the two angles?

$\textbf{(A)}\ 75\qquad\textbf{(B)}\ 90\qquad\textbf{(C)}\ 135\qquad\textbf{(D)}\ 150\qquad\textbf{(E)}\ 270$
## Solution 1
By: dragonfly

We set up equations to find each angle. The larger angle will be represented as x and the smaller angle will be represented as y, in degrees. This implies that

$$4x=5y$$

and

$$2\times(90-x)=90-y$$

since the larger the original angle, the smaller the complement.

We then find that $x=75$ and $y=60$, and their sum is $\boxed{\textbf{(C)}\ 135}$
## Solution 2
We can visualize the problem like so:

> [Asymptote diagram - not rendered in Markdown]

```asy
path b = brace((0,10),(90,10),5); draw(b); label("$\circ$",b,N); draw("$5x$",(0,0)--(75,0),N); draw((75,2.5)--(75,-2.5)); draw("$1y$",(75,0)--(90,0),N); draw("$4x$",(0,-10)--(60,-10),S); draw((60,-7.5)--(60,-12.5)); draw("$2y$",(60,-10)--(90,-10),S); draw((0,5)--(0,-15)); draw((90,5)--(90,-15));
```

$$5x+1y = 90^\circ = 4x+2y$$
Moving like terms to the same side gets x = y, and substituting this back gets $6x=90^\circ \impliesx =\frac{90^\circ}{6} = 15^\circ,$ so the sum of the degree measures is $5x+$4x = $9x=9(15)=\boxed{\textbf{(C)}\ 135}.$ ~emerald_block
## See Also
