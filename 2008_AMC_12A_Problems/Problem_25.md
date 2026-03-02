# 2008 AMC 12A Problem 25

## Problem
A sequence ($a_1,b_1), (a_2,b_2), (a_3,b_3), \ldots$ of points in the coordinate plane satisfies

($a_{n + 1}$, $b_{n + 1}) = (\sqrt$ {3}$a_n-b_n$, $\sqrt$ {3}$b_n+a_n$)  for $n = $1,2,3,$\ldots.$

Suppose that ($a_{100}$,$b_{100}$) = (2,4).  What is $a_1+b_1$?


$$\mathrm{(A)}\ -\frac{1}{2^{97}}\qquad\mathrm{(B)}\ -\frac{1}{2^{99}}\qquad\mathrm{(C)}\ 0\qquad\mathrm{(D)}\ \frac{1}{2^{98}}\qquad\mathrm{(E)}\ \frac{1}{2^{96}}$$

## Solution 1
This sequence can also be expressed using matrix multiplication as follows:


$$
\left[ \begin{array}{c} a_{n+1} \\ b_{n+1} \end{array} \right] = \left[ \begin{array}{cc} \sqrt{3} & -1 \\ 1 & \sqrt{3} \end{array} \right] \left[ \begin{array}{c} a_{n} \\ b_{n} \end{array} \right] = 2 \left[ \begin{array}{cc} \cos 30^\circ & -\sin 30^\circ \\ \sin 30^\circ & \ \cos 30^\circ \end{array} \right] \left[ \begin{array}{c} a_{n} \\ b_{n} \end{array} \right].
$$


Thus, ($a_{n+1}$ , $b_{n+1}$) is formed by rotating ($a_n$ , $b_n$) counter-clockwise about the origin by $30^\circ$ and dilating the point's position with respect to the origin by a factor of 2.

So, starting with ($a_{100}$,$b_{100}$) and performing the above operations 99 times in reverse yields $(a_1,b_1)$.

Rotating (2,4) clockwise by 99 $\cdot 30^\circ \equiv 90^\circ$ yields (4,-2). A dilation by a factor of $\frac{1}{2^{99}}$ yields the point ($a_1,b_1) = \left(\frac{4}{2^{99}}, -\frac{2}{2^{99}} \right) = \left(\frac{1}{2^{97}}, -\frac{1}{2^{98}} \right).$

Therefore, $a_1+b_1 = \frac{1}{2^{97}} - \frac{1}{2^{98}} = \frac{1}{2^{98}} \Rightarrow D.$
## Solution 2 (algebra)
Let (x,y)=$(a_1,b_1)$. Then, we can begin to list out terms as follows:

$$(a_2,b_2)=(x\sqrt{3}-y,y\sqrt{3}+x)$$

$$(a_3,b_3)=(2x-2y\sqrt{3},2y+2x\sqrt{3})$$

$$(a_4,b_4)=(-8y,8x)$$

We notice that the sequence follows the rule ($a_{n+3}$,$b_{n+3})=(-2^3b_n$,$2^3a_n$)

We can now start listing out every third point, getting:

$$(a_1,b_1)=(x,y)$$

$$(a_4,b_4)=(-2^3y,2^3x)$$

$$(a_7,b_7)=(-2^6x,-2^6y)$$

$$(a_{10},b_{10})=(2^9y,-2^9x)$$

$$(a_{13},b_{13})=(2^{12}x,2^{12}y)$$

We can make two observations from this:

(1) In $a_n$, the coefficient of x and y is $2^{n-1}$

(2) The positioning of x and y, and their signs, cycle with every 12 terms.

We know then that from (1), the coefficients of x and y in ($a_{100}$,$b_{100}$) are both $2^{99}$

We can apply (2), finding 100 $\text{(mod }12)=4,$ so the positions and signs of x and y are the same in ($a_{100}$,$b_{100}$) as they are in ($a_{4}$,$b_{4}$).

From this, we can get ($a_{100}$,$b_{100})=(-2^{99}$y,$2^{99}$x). We know that ($a_{100}$,$b_{100}$)=(2,4), so we get the following:

$$-2^{99}y=2 \Rightarrow y=-\frac{1}{2^{98}}$$

$$2^{99}x=4 \Rightarrow x=\frac{1}{2^{97}}$$

The answer is $x+y=\frac{1}{2^{97}}-\frac{1}{2^{98}}=\boxed{\textbf{(D) }\frac{1}{2^{98}}}..$
## Solution 3
The ordered pairs and $\sqrt{3}$'s makes us think to use complex numbers. We have ($a_{n+1}$,$b_{n+1}) = 2\left(\frac{\sqrt{3}}{2}$a_n - $\frac{1}{2}$b_n, $\frac{\sqrt{3}}{2}$b_n + $\frac{1}{2}$a_n$\right),$ so $a_{n+1}+b_{n+1}$i = $2\left(\frac{\sqrt{3}}{2} + \frac{1}{2}i\right)(a_n + b_ni) = \frac{1}{2}e^{i\pi/6}(a_n+b_ni$). Letting $z_n=a_n+b_ni$ (so $z_{n+1}=a_{n+1}+b_{n+1}$i), we have $z_{n+1}=2e^{i\pi/6}$z_n. Letting $n\rightarrown-1$, we have $z_n=2e^{i\pi/6}z_{n-1}$, so $z_{n-1}=\frac{1}{2}e^{-i\pi/6}$z_n. This is the reverse transformation. We have

$$
z_{99} = \frac{1}{2}e^{-i\pi/6}z_{100}
z_{98} = \frac{1}{2^2}e^{2(-i\pi/6)}z_{100}
\vdots
z_{1} = \frac{1}{2^{99}}e^{99(-i\pi/6)}z_{100}
= \frac{1}{2^{99}}e^{-i\pi/2}z_{100} = -\frac{1}{2^{99}}i(2 + 4i) = \frac{1}{2^{97}} - \frac{1}{2^{98}}i.
$$


Hence, $a_1+b_1 = \frac{1}{2^{97}} - \frac{1}{2^{98}} = \boxed{\mathbf{(D)}\frac{1}{2^{98}}}$ ~ brainfertilzer.
## Solution 4 (Kinda braindead)
Start by turning the two equations into $a_n=\frac{a_{n+1}\sqrt{3}+b_{n+1}}{4}$ and $b_n=\frac{b_{n+1}\sqrt{3}-a_{n+1}}{4}.$ Note that these are just obtained by solving the equations.

This makes finding values of $a_n$ and $b_n$ much easier, and soon we notice that $a_{97}=\frac{1}{2}$ and $b_{97}=-\frac{1}{4}.$ After that, we get that $a_{94}=-\frac{1}{32}$ and $b_{94}=-\frac{1}{16}.$ Observe that |$a_n$| = |$\frac{b_{n+3}}{8}$| and |$b_n$| = |$\frac{a_{n+3}}{8}$|. This is basically just ignoring signs.

Now, we proceed to find |$a_$1| = $\frac{1}{2^{97}}$ while |$b_$1| = $\frac{1}{2^{98}}.$ Despite there being 4 possible sign combinations for $(a_1, b_1)$, the only achievable answer choice is $\boxed{\textbf{(D)}\frac{1}{2^{98}}}$

*~skibbysiggy*
## Video Solution
https://www.youtube.com/watch?v=_4UJzyBslFA
## See Also
