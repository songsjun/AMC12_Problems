# 2014 AMC 12B Problem 25

## Problem
Find the sum of all the positive solutions of


$$2\cos2x \left(\cos2x - \cos{\left( \frac{2014\pi^2}{x} \right) } \right) = \cos4x - 1$$


$\textbf{(A)}\ \pi \qquad\textbf{(B)}\ 810\pi \qquad\textbf{(C)}\ 1008\pi \qquad\textbf{(D)}\ 1080 \pi \qquad\textbf{(E)}\ 1800\pi$
## Solution 1
Rewrite $\cos{4x} - 1$ as $2\cos^2{2x} - 2.$  Now let $a =\cos{2x},$ and let $b =\cos{\left( \frac{2014\pi^2}{x} \right) }.$  We have:
$$2a(a - b) = 2a^2 - 2$$

Therefore, ab = 1.

Notice that either $a = 1$ and $b = 1$ or a = -1 and b = -1.  For the first case, $a = 1$ only when $x =k\pi$ and k is an integer.  $b = 1$ when $\frac{2014\pi^2}{k\pi}$ is an even multiple of $\pi,$ and since 2014 = 2*19*53, $b =1$ only when k is an odd divisor of 2014.  This gives us these possible values for x:
$$x= \pi, 19\pi, 53\pi, 1007\pi$$
For the case where a = -1, $\cos{2x} = -1,$ so $x =\frac{m\pi}{2},$ where m is odd.  $\frac{2014\pi^2}{\frac{m\pi}{2}}$ must also be an odd multiple of $\pi$ in order for b to equal -1, so $\frac{4028}{m}$ must be odd.  We can quickly see that dividing an even number by an odd number will never yield an odd number, so there are no possible values for m, and therefore no cases where a = -1 and b = -1. Therefore, the sum of all our possible values for x is
$$\pi + 19\pi + 53\pi + 1007\pi = \boxed{\textbf{(D)}\ 1080 \pi}$$
## Solution 2
Very similar to the solution above, re-write the expression using $\cos 4x = 2 \cos^2 2$x - 1:


$$2\cos2x \left(\cos2x - \cos{\left( \frac{2014\pi^2}{x} \right) } \right) = 2 \cos^2 2x - 2$$


Now, expand the LHS and cancel terms:


$$2 \cos^2 2x - 2 \cos 2x \cos{\left( \frac{2014\pi^2}{x} \right) } = 2 \cos^2 2x - 2$$


$$\cos 2x \cos{\left( \frac{2014\pi^2}{x} \right) } = 1$$

Now we use product-to-sum identities to get:


$$\frac{1}{2} \Biggl( \cos\Bigl( 2x + \frac{2014 \pi^2}{x} \Bigr) + \cos\Bigl( 2x + \frac{2014 \pi^2}{x} \Bigr) \Biggr) = 1$$


$$\cos{\left(2x + \left( \frac{2014\pi^2}{x} \right) \right)} = 1$$

Notice that for any $\theta, \max{\cos \theta} = 1.$ This is achieved when $\theta = 0,$ or equivalently

$$2x - \frac{2014\pi^2}{x} \equiv 0 \mod 2\pi$$

We can cleverly assume $x=c\pi$ for some real c. Then, we must have

$$2c - \frac{2014}{c} \equiv 0 \mod 2$$

In order for this to be satisfied, $\frac{2014}{c}$ must be an even integer. Factoring 2014 = 2 $\cdot 19 \cdot 53,$ we see that c must be a positive odd integer that divides 2014. Our only positive valid c are $c = 1$, 19, 53, 1007. Our answer is just $\pi(1+19+53+1007) = 1080\pi \implies \textbf{(D)}.$

*~FIREDRAGONMATH16*
## Solution 3
Rewriting $\cos{4x} - 1$ as $2\cos^2{2x} - 2$ and transposing $2\cos{2x}$ from the LHS to the RHS, we get,


$$
\cos{2x} - \cos{\left(\frac{2014\pi^2}{x}\right)} = 1 - \frac{1}{\cos{2x}}
\implies \underbrace{\cos{2x} + \frac{1}{\cos{2x}}}_{\text{LHS}} = \underbrace{1 + \cos{\left(\frac{2014\pi^2}{x}\right)}}_{\text{RHS}}
$$


By the [https://artofproblemsolving.com/wiki/index.php/AM-GM_Inequality AM-GM Inequality],

$$\cos{2x} + \frac{1}{\cos{2x}} \in (-\infty, -2] \cup [2, \infty)$$

Also, because of the range of $\cos,$

$$1 + \cos{\left(\frac{2014\pi^2}{x}\right)} \in [0, 2]$$

Hence, $\text{LHS} = \text{RHS} = 2,$ and we get (m, n $\in \mathbb{Z}),$


$$
- \cos{2x} = 1 \implies x = m\pi \hspace{75pt} \cdots\cdots (1)
- \cos{\left(\frac{2014\pi^2}{x}\right)} = 1 \implies x = \frac{1007\pi}{n} \hspace{22pt} \cdots\cdots (2)
$$


From (1) and (2),

$$
m = \frac{1007}{n}
\implies m \in \{1, 19, 53, 1007\}
\implies x \in \{1\pi, 19\pi, 53\pi, 1007\pi\}
$$


Therefore, sum of values of x is $\pi + 19\pi + 53\pi + 1007\pi = \boxed{\textbf{(D)}\ 1080\pi}.$

~ [https://artofproblemsolving.com/wiki/index.php/User:Plusone plusone]
## See also
