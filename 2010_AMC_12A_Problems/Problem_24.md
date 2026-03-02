# 2010 AMC 12A Problem 24

## Problem
Let f(x) = $\log_{10} \left(\sin(\pi x) \cdot \sin(2 \pi x) \cdot \sin (3 \pi x) \cdots \sin(8 \pi x)\right).$ The intersection of the domain of f(x) with the interval [0,1] is a union of n disjoint open intervals. What is n?

$\textbf{(A)}\ 2 \qquad \textbf{(B)}\ 12 \qquad \textbf{(C)}\ 18 \qquad \textbf{(D)}\ 22 \qquad \textbf{(E)}\ 36$
## Solution 1
The question asks for the number of disjoint open intervals, which means we need to find the number of disjoint intervals such that the function is defined within them.

We note that since all of the $\sin$ factors are inside a logarithm, the function is undefined where the inside of the logarithm is less than or equal to 0.

First, let us find the number of zeros of the inside of the logarithm.


$$
\begin{align*}\sin(\pi x) \cdot \sin(2 \pi x) \cdot \sin (3 \pi x) \cdots \sin(8 \pi x) &= 0\\ \sin(\pi x) &= 0\\ x &= 0, 1\\ \sin(2 \pi x) &= 0\\ x &= 0, \frac{1}{2}, 1\\ \sin(3 \pi x) &= 0\\ x &= 0, \frac{1}{3}, \frac{2}{3}, 1\\ \sin(4 \pi x) &= 0\\ x &= 0, \frac{1}{4}, \frac{2}{4}, \frac{3}{4}, 1\\ &\cdots\end{align*}
$$


After counting up the number of zeros for each factor and eliminating the excess cases we get 23 zeros and 22 intervals.

In order to find which intervals are negative, we must first realize that at every zero of each factor, the sign changes. We also have to be careful, as some zeros are doubled, or even tripled, quadrupled, etc.

The first interval $\left(0, \frac{1}{8}\right)$ is obviously positive. This means the next interval $\left(\frac{1}{8}, \frac{1}{7}\right)$ is negative. Continuing the pattern and accounting for doubled roots (which do not flip sign), we realize that there are 5 negative intervals from 0 to $\frac{1}{2}.$ Since the function is symmetric, we know that there are also 5 negative intervals from $\frac{1}{2}$ to 1.

And so, the total number of disjoint open intervals is 22 - $2\cdot{5} = \boxed{12\ \textbf{(B)}}$
## Solution 2 (cheap)
Note that the expression $\sin(\pi x) \cdot \sin(2 \pi x) \cdot \sin (3 \pi x) \cdots \sin(8 \pi x)$  must be greater than zero, since logarithm functions are undefined for 0 and negative numbers. Let $x_1, x_2, x_3, ..., x_8$ temporarily be the dependent variables of the functions $y_1=\sin(\pi x_1),y_2 = \sin(2\pi x_2),$ ..., $y_8=\sin(8\pi x_8).$ It is easy to see that for $y_i$ to be positive for $1\leqi\leq8, \lfloor$ i $x_i\rfloor$ must be even for 1 $\leqi\leq8.$ Since an even number of positives times an even number of negatives equals a positive, there can be 2, 4, 6,  or 8 positive values of $y_i$ for 1 $\leqi\leq 8$ for a given value of x. (since $y_1$ is always positive on the range [0, 1])
Since MAA allows rulers (and you should bring one to the actual exam), use it to your advantage and draw a larged scaled number line from 0 to 1. (I recommend increments of at most 0.1.) If you don't have a ruler but have graph paper, you can use that instead. Then, designate rows for $y_1, y_2, ..., y_8$, respectively. Draw a large bar (label it with + so you know it's positive) for all values of $x_i$ such that $\lfloor$ i $x_i\rfloor$ is even, and do that for all eight rows. Then, use your ruler (or another viable straightedge, such as the edge of another sheet of paper), place the straightedge perpendicular to the vertical line on your digram at 0, and slowly work your way to 1, marking all disjoint intervals in which your straightedge touches 2, 4, 6,  or 8 boxes simultaneously. (If an interval excludes a value in that interval, you still have to count it as two disjoint intervals. Note that this will be important as to not undercounting disjoint intervals. )
If done correctly, you should obtain $\boxed{12\ \textbf{(B)}}$ as your answer.

*~FidgetBoss 4000*
## Additional Explanation
You should be able to somewhat visualize what the $\sin$ function looks like (if you can't then you should look it up and try to memorize it). To summarize, the graph of $y=\sin{x}$ is positive from the interval (0, $\pi)$ and negative from the interval ($\pi, 2\pi) (n$otice how the intervals use parentheses instead of brackets, as brackets would denote inclusive bounds and that it incorrect).

All of the various $\sin$ functions that we are multiplying are in the form of $k\pi$ x, which means the intervals have now changed to integer values.

Also, the period of the function $y =\sin{k \pi x}$ is equivalent to $\frac{2}{k}$; For example the period of $y=\sin{4\pi x}$ is $\frac{1}{2}.$

Let a "wave" be a full period of a $\sin$ curve. Then, a "half-wave" is half of a full period of a $\sin$ curve. Over the interval [0, 1], $y=\sin{\pi x}$ will display 1 "half-wave", $y=\sin{2\pi x}$ will display 2 "half-waves", and $y=\sin{k\pi x}$ will display k "half-waves". Also notice that the graph of $y=\sin{k \pi x}$ crosses the x-axis exactly $k-1$ times over the interval (0, 1).

The problem asks for the number of [disjoint](https://artofproblemsolving.com/wiki/index.php/disjoint) intervals, not the values of the intervals themselves. This means we only want the positive values of

$$\prod_{k=1}^8 \sin{k\pi x}$$

(the product of all of the various $\sin$ functions)

We don't care about the specific values themselves, we just need to know what the sign (+/-) of the product is. Notice that if an even number of the functions are negative, the product will be positive; conversely, if the number of negative functions is odd, the product will be negative. Therefore we only need to count the number of intervals during which an even number of functions are negative/positive. By definition, the sign of a function changes after it crosses one of its roots (because trig functions don't have multiplicities). Notice that the roots of y = $\sin{k\pi x}$ are in the form

$$\frac{1}{k}, \frac{2}{k}, \frac{3}{k},...$$

(this is in agreement with the fact that $y=\sin{k \pi x}$ crosses the x-axis exactly $k-1$ times over the interval (0, 1))

Therefore, across the interval [0, 1], the sign will change every time the function hits a root of one of the $\sin$ functions. We must be careful, however, as some roots (such as $\frac{1}{2}$ and $\frac{2}{4})$ are duplicates.

Notice that the duplicates always come in pairs. For example, $\frac{1}{2}$ is also $\frac{2}{4}, \frac{3}{6},$ and $\frac{4}{8}$; there are four equivalent roots. Across the interval [0, 1], there are no duplicate roots that come in triplets, or in fives. The roots are always single, doubled up, or quadrupled up. So every time the function reaches a single root, it switches signs, and every time it reaches a duplicate root, the sign remains the same (this still counts as 2 distinct intervals, though, as the zeroes "separate" them). Listing out the roots (not including $x=0$ and $x=1$):

1: n/a

$$2: \frac{1}{2}$$

$$3: \frac{1}{3}, \frac{2}{3}$$

$$4: \frac{1}{4}, \frac{2}{4}, \frac{3}{4}$$

$$5: \frac{1}{5}, \frac{2}{5}, \frac{3}{5}, \frac{4}{5}$$

$$6: \frac{1}{6}, \frac{2}{6}, \frac{3}{6}, \frac{4}{6}, \frac{5}{6}$$

$$7: \frac{1}{7}, \frac{2}{7}, \frac{3}{7}, \frac{4}{7}, \frac{5}{7}, \frac{6}{7}$$


$$8: \frac{1}{8}, \frac{2}{8}, \frac{3}{8}, \frac{4}{8}, \frac{5}{8}, \frac{6}{8}, \frac{7}{8}$$


Then in order (showing duplicates as well):


$$\frac{1}{8}, \frac{1}{7}, \frac{1}{6}, \frac{1}{5}, \frac{1}{4}, \frac{1}{4}, \frac{2}{7}, \frac{1}{3}, \frac{1}{3}, \frac{3}{8}, \frac{2}{5}, \frac{3}{7}, \frac{1}{2}, \frac{1}{2}, \frac{1}{2}, \frac{1}{2}, \frac{4}{7}, \frac{3}{5}, \frac{5}{8}, \frac{2}{3}, \frac{2}{3}, \frac{5}{7}, \frac{3}{4}, \frac{3}{4}, \frac{4}{5}, \frac{5}{6}, \frac{6}{7}, \frac{7}{8}$$


Then creating a sequence of signs based on the roots:

+,-,+,-,+,+,-,-,+,-,+,+,-,+,-,-,+,+,-,+,-,+

We see that there are 12 positive intervals $\Rightarrow \boxed{\text{B}}.$
## Graph
https://www.desmos.com/calculator/fahoyoijac
## See also
