# 2022 AMC 12A Problem 18

> This problem is the same as [2022 AMC 10A #18](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10A_Problems/Problem_18) and [2022 AMC 12A #18](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12A_Problems/Problem_18).
## Problem
Let $T_k$ be the transformation of the coordinate plane that first rotates the plane $k$ degrees counterclockwise around the origin and then reflects the plane across the $y$-axis. What is the least positive
integer $n$ such that performing the sequence of transformations $T_1, T_2, T_3, \cdots, T_n$ returns the point $(1,0)$ back to itself?

$\textbf{(A) } 359 \qquad \textbf{(B) } 360 \qquad \textbf{(C) } 719 \qquad \textbf{(D) } 720 \qquad \textbf{(E) } 721$
## Solution 1
Let $P=(r,\theta)$ be a point in polar coordinates, where $\theta$ is in degrees.

Rotating $P$ by $k^{\circ}$ counterclockwise around the origin gives the transformation $(r,\theta)\rightarrow(r,\theta+k^{\circ}).$ Reflecting $P$ across the $y$-axis gives the transformation $(r,\theta)\rightarrow(r,180^{\circ}-\theta).$ Note that


$$\begin{align*}

$$
T_k(P)&=(r,180^{\circ}-\theta-k^{\circ}), \\
T_{k+1}(T_k(P)) &= (r,\theta -1^{\circ}).
$$

$\end{align*}$$$


We start with $(1,0^{\circ})$ in polar coordinates. For the sequence of transformations $T_1, T_2, T_3, \cdots, T_k,$ it follows that

- After $T_1,$ we have $(1,179^{\circ}).$

- After $T_2,$ we have $(1,-1^{\circ}).$

- After $T_3,$ we have $(1,178^{\circ}).$

- After $T_4,$ we have $(1,-2^{\circ}).$

- After $T_5,$ we have $(1,177^{\circ}).$

- After $T_6,$ we have $(1,-3^{\circ}).$

- ...

- After $T_{2k-1},$ we have $(1,180^{\circ}-k^{\circ}).$

- After $T_{2k},$ we have $(1,-k^{\circ}).$

The least such positive integer $k$ is $180.$ Therefore, the least such positive integer $n$ is $2k\boxed{\textbf{(A) } 359}.$

*~MRENTHUSIASM*
## Solution 2
Note that since we're reflecting across the $y$-axis, if the point ever makes it to $(-1,0)$ then it will flip back to the original point. Note that after $T_1$ the point will be $1$ degree clockwise from the negative $x$-axis. Applying $T_2$ will rotate it to be $1$ degree counterclockwise from the negative $x$-axis, and then flip it so that it is $1$ degree clockwise from the positive $x$-axis. Therefore, after every $2$ transformations, the point rotates $1$ degree clockwise. To rotate it so that it will rotate $179$ degrees clockwise will require $179 \cdot 2 = 358$ transformations. Then finally on the last transformation, it will rotate on to $(-1,0)$ and then flip back to its original position. Therefore, the answer is $358+1 = 359 = \boxed{\textbf{(A) } 359}$.

*~KingRavi*
## Solution 3
So, you don't know polar coordinates (Solution 1) nor came up with Solution 2's logic, then, here we go!

The easy solution is to notice that, without reflections and taking $k=1$, there are 360 turns that need to be made.

Now take $k=2$. We see that there are 180 rotations, so the number of rotations is just $360/k$.

Now include the reflections over the $y$ axis.

Say that each time we reflect a point over the $y$ axis, we draw a line.

Each time we reflect over the $y$ axis, we see more and more lines that generate. For $k=1$, there are quite obviously 360 of these lines.

However, one can see that this works for every single case, because when we reflect it over the $y$ axis and make a $k^\circ$ rotation, we fill up all the missed gaps until we reach the end of a sequence - I prove this on section 1.1.

But wait! We overcounted by one line! Notice how I said there were 360 lines, but the line $x=1$ intersects $y=0$ is already given to you, and that is when $T_k = 0$, which is the point $(1, 0)$! So our final answer is $3$60-1 = $\boxed{\textbf{(A) } 359}.$

*~Pinotation*
### Proof
A way you can prove such an assumption is by taking ideas like addition. We know that eventually there exists a number $N$ such that $l \times N = m$, where $m$ has a units digit of $l$. Utilizing the same approach, we can find that this actually works.

*~Pinotation*
## Solution 4
In degrees:

Starting with $n=0$, the sequence goes ${0}\rightarrow {179}\rightarrow {359}\rightarrow {178}\rightarrow {358}\rightarrow {177}\rightarrow {357}\rightarrow\cdots.$

We see that it takes $2$ steps to downgrade the point by $1^{\circ}$. Since the $1$st point in the sequence is ${179}$, the answer is $1+2(179)=\boxed{\textbf{(A) } 359}.$
## Solution 5 (Simple)
We can consider the rotations and reflections separately. For the rotations, each rotation turns it by the next natural number. Thus the total number of degrees turned would be a triangle number. We test the smallest number, $359$ first, and we get that it turns $\frac{(1+359)359}{2} = 180n$, where $n$ is an integer. Thus, the point would be rotated to $(-1,0)$. We may be tempted to dismiss this option but we haven't considered the reflections. Each reflection acts as a $180^{\circ}$ rotation, so every two reflections cancel. However, $359$ is odd so we have to reflect $(-1,0)$, taking us to $(1,0)$, which is what we want. Thus we get $\boxed{\textbf{(A) } 359}$.
## Solution 6 (Complex)
Rotations and reflections in 2D are very nice to describe using complex numbers in polar form. Reflections and rotations also don't affect the length (modulus or absolute value) of a complex number. This motivates us to set $z = \exp (i\theta)$, starting with $z=1+0i=\exp(i0)$.
Then, we can describe rotations and reflections about the $y$-axis using these formulas:


$$\text{Rotation}(\exp(i\theta), k): \exp(i\theta) \mapsto \exp(i(\theta + k))$$


$$\text{Reflection}(\exp(i\theta)): \exp(i\theta) \mapsto \exp i (180^\circ - \theta) = -\exp(i(-\theta))$$


If we apply two successive iterations, we see a simplification:


$$T_k(\exp(i\theta)) = -\exp(-i(\theta+k))$$


$$
\begin{aligned}
T_{k+1}(T_k(\exp(i\theta))) &= T_{k+1}(-\exp(i(-\theta-k))
$$

\\
$$&= --\exp(-i(-\theta-k+(k+1))$$
\\
$$&= \exp i(\theta-1)$$
$\end{aligned}$

We also can calculate $T_1(\exp i0) = \exp 179^\circ$. Thus, the point $(1,0)$ gets sent back to when all double iterations after $1$ cancel $\circ$. $\left(\frac{n-1}{2}\right)=0$ so $n = 1 + 2 \cdot 179 = \boxed{\textbf{(A) }359}$.
## Solution 7 (Matrices)
Similar to the above solution, one can use rotation matrices to compute it.


$$
(i.e. $\begin{bmatrix} cos(\theta) & -sin(\theta) \\ sin(\theta) & cos(\theta) \end{bmatrix}$)
$$


For the reflection, use the reflection matrix (i.e. $\begin{bmatrix} -1 & 0 \\ 0 & 1 \end{bmatrix}$)

Then proceed like Solution 5.

*~QuantumMathTitan*
## Video Solution
https://youtu.be/QQrsKTErJn8

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution (Simple and Fun!!!)
https://youtu.be/7yAh4MtJ8a8?si=2UC_9X7DjkL8UW5C&t=4968

*~Math-X*
## See also
