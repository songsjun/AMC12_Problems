# 2009 AMC 12B Problem 22

## Problem
Parallelogram ABCD has area 1,\!000,\!000. Vertex A is at (0,0) and all other vertices are in the first quadrant. Vertices B and D are lattice points on the lines y = x and y = kx for some integer k > 1, respectively. How many such parallelograms are there? (A lattice point is any point whose coordinates are both integers.)

$\textbf{(A)}\ 49\qquad \textbf{(B)}\ 720\qquad \textbf{(C)}\ 784\qquad \textbf{(D)}\ 2009\qquad \textbf{(E)}\ 2048$
## Solution
### Solution 1
The area of any parallelogram ABCD can be computed as the size of the vector product of $\overrightarrow{AB}$ and $\overrightarrow{AD}.$

In our setting where A=(0,0), B=(s,s), and D=(t,kt) this is simply $s\cdot$ kt - $s\cdot$ t = (k-1)$$st.

In other words, we need to count the triples of integers (k,s,t) where k>1, s,t>0 and $(k-1)$st = 1,\!000,\!$000 = 2^6 5^6.$

These can be counted as follows: We have 6 identical red balls (representing powers of 2), 6 blue balls (representing powers of 5), and three labeled urns (representing the factors $k-1$, s, and t). The red balls can be distributed in {$8\choose 2$} = 28 ways, and for each of these ways, the blue balls can then also be distributed in 28 ways. (See [Distinguishability](https://artofproblemsolving.com/wiki/index.php/Distinguishability) for a more detailed explanation.)

Thus there are exactly $28^2 = 784$ ways how to break 1,\!000,\!000 into three positive integer factors, and for each of them we get a single parallelogram. Hence the number of valid parallelograms is 784 $\longrightarrow \boxed{C}.$
### Solution 2
Without the vector product the area of ABCD can be computed for example as follows: If B=(s,s) and D=(t,kt), then clearly C=(s+t,s+kt). Let B'=(s,0), C'=(s+t,0) and D'=(t,0) be the orthogonal projections of B, C, and D onto the x axis. Let [P] denote the area of the polygon P. We can then compute:


$$
\begin{align*} [ABCD] & = [ADD'] + [DD'C'C] - [BB'C'C] - [ABB'] \\ & = \frac{kt^2}2 + \frac{s(s+2kt)}2 - \frac{t(2s+kt)}2 - \frac{s^2}2 \\ & = kst - st \\ & = (k-1)st. \end{align*}
$$

The remainder of the solution is the same as the above.
## Solution 3
We know that A is (0, 0). Since B is on the line y=x, let it be represented by the point (b, b). Similarly, let D be (d, kd). Since this is a parallelogram, sides $\overline{AD}$ and $\overline{BC}$ are parallel. Therefore, the distance and relative position of D to A is equivalent to that of C to B (if we take the translation of A to D and apply it to B, we will get the coordinates of C). This yields C (b+d, b+kd). Using the [Shoelace Theorem](https://artofproblemsolving.com/wiki/index.php/Shoelace_Theorem) we get


$$1,000,000 = \frac{1}{2}|\left(b(b+kd) + (b+d)(kd)\right) - \left(b(b+d) + (b+kd)d\right)|$$


$$\Rightarrow 2,000,000 = |2kbd - 2bd|$$

$$\Rightarrow 1,000,000 = |kbd - bd|$$

Since k > 1, kbd > bd. The equation becomes

$$1,000,000 = (k-1)bd$$

$$\Rightarrow \frac{1,000,000}{k-1} = bd$$

Since k must be a positive integer greater than 1, we know $k-1$ will be a positive integer. We also know that bd is an integer, so $k-1$ must be a factor of 1,000,000. Therefore bd will also be a factor of 1,000,000.

Notice that $1,000,000 = 10^6 = 2^6*5^6.$

Let b be $2^x5^y$ such that x, y are integers on the interval [0, 6].

Let d be $2^w5^z$ such that w, z are integers, x+w $\le 6,$ and y+z $\le 6.$

For a pair (x, y), there are 7-x possibilities for w and 7-y possibilites for z (d doesn't have to be the co-factor of 1,000,000, it just can't be big enough such that bd > 1,000,000), for a total of (7-x)(7-y) possibilities. So we want

$$\sum_{k=0, i=0}^6 (7-k)(7-i)$$

$\left(\text{the sum of the number of possible pairs}(w, z) \text{ for all pairs}(k , i)\text{ for }$ k[0, 6]$\text{ and }$ i[0, 6]$\right)$

Notice that if we "fix" the value of k, at, say 6, then run through all of the values of i, change the value of k to 5, and run through all of the values of i again, and so on until we exhaust all 49 combinations of (k, i) we get something like this:

1*1 + 1*2 + ... + 1*6 + 1*7 + 2*1 + 2*2 + ... + 2*6 + 2*7 + ..... + 7*1 + 7*2 + ... + 7*6 + 7*7

which can be rewritten

$1(1+2+...+7)+2(1+2+...+7)+.....+7(1+2+...+7)$

$$\Rightarrow (1+2+...+7)(1+2+...+7)$$

$$\Rightarrow 28^2$$

$$\Rightarrow 784$$

So there are 784 possible sets of coordinates B, C, and D $\Rightarrow \boxed{\text{C}}.$

Note: this solution could be greatly simplified by using the Shoelace Formula on the triangle ABD, which we know has half the area of the parallelogram. This eliminates the need to find the coordinates of point C.

(Notational note: I'm not sure if the notation for double index summation is correct or even applicable in the context of this problem. If someone could fix the notation so that it is correct, or replace it without changing the general content of this solution, that would be great. If the notation is correct, then just delete this footnote)
## See Also
