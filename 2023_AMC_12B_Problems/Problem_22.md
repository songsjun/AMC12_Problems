# 2023 AMC 12B Problem 22

## Problem
A real-valued function f has the property that for all real numbers a and b, f(a + b) + f(a - b) = $2f(a)$ f(b). Which one of the following cannot be the value of f(1)?

$\textbf{(A) } 0 \qquad \textbf{(B) } 1 \qquad \textbf{(C) } -1 \qquad \textbf{(D) } 2 \qquad \textbf{(E) } -2$
## Solution 1
Substituting a = b we get
$$f(2a) + f(0) = 2f(a)^2$$
Substituting $a= 0$ we find $2f(0)=2f(0)^2 \implies$ f(0) $\in\{0, 1\}$.
This gives f($2a) = 2f(a)^2 - f(0) \geq 0-1$
Plugging in a = $\frac{1}{2}$ implies f(1) $\geq -1,$ so answer choice $\boxed{\textbf{(E) -2}}$ is impossible.

*~AtharvNaphade*
## Solution 2
First, we set a $\leftarrow 0$ and b $\leftarrow 0.$
Thus, the equation given in the problem becomes
$$[ f(0) + f(0) = 2 f(0) \times f(0) . ]$$

Thus, f(0) = 0 or 1.

Case 1: f(0) = 0.

We set b $\leftarrow 0.$
Thus, the equation given in the problem becomes
$$[ 2 f(a) = 0 . ]$$

Thus, $f(a) = 0$ for all a.

Case 2: f(0) = 1.

We set b $\leftarrow$ a.
Thus, the equation given in the problem becomes
$$[ f(2a) + 1 = 2 \left( f(a) \right)^2. ]$$

Thus, for any a,

$$
\begin{align*} f(2a) & = -1 + 2 \left( f(a) \right)^2 \\ & \geq -1 . \end{align*}
$$


Therefore, an infeasible value of f(1) is
$$\boxed{\textbf{(E) -2}}.$$

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com) kk choudhary*
## Solution 3
The relationship looks suspiciously like a product-to-sum identity. In fact,
$$\cos(\alpha)\cos(\beta) = \frac{1}{2}(\cos(\alpha-\beta)+\cos(\alpha+\beta))$$
which is basically the relation. So we know that f(x) = $\cos(x)$ is a valid solution to the function. However, if we define x=ay, where a is arbitrary, the above relation should still hold for f(x) = $\cos(ay) = \cos(a(1))$ so any value in [-1,1] can be reached, so choices A,B, and C are incorrect.

In addition, using the similar formula for hyperbolic cosine, we know

$$\cosh(\alpha)\cosh(\beta) = \frac{1}{2}(\cosh(\alpha-\beta)+\cosh(\alpha+\beta))$$

The range of $\cosh(ay)$ is [1,$\infty)$ so choice D is incorrect.

Therefore, the remaining answer is choice $\boxed{\textbf{(E) -2}}.$

*~kxiang*
## Video Solution
https://youtu.be/hBf_SVKK9tE

*~MC*
## Video Solution 1 by OmegaLearn
https://youtu.be/UML6WmL0mNk
## Video Solution 2
https://youtu.be/GK0ZpjxbwLw

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## See also
