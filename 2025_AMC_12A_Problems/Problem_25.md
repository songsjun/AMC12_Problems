# 2025 AMC 12A Problem 25

## Problem
Polynomials P(x) and Q(x) each have degree 3 and leading coefficient 1, and their roots are all elements of $\{1,2,3,4,5\}$. The function f(x) = $\dfrac{P(x)}{Q(x)}$ has the property that there exist real numbers a < b < c < d such that the set of all real numbers x such that f(x) $\leq 0$ consists of the closed interval [a,b] together with the open interval (c,d). How many ordered pairs of polynomials (P, Q) are possible?

$\textbf{(A)}~7 \qquad \textbf{(B)}~9 \qquad \textbf{(C)}~11 \qquad \textbf{(D)}~12 \qquad \textbf{(E)}~13 \qquad \textbf{(F)}~8$
## Why MAA initially got this wrong
If you look at solution 2, they overcounted the second case, essentially saying that f had 2 choices because it could equal c or d, so the intended answer was 3 + 5 $\cdot 2 = 13.$ This would be correct if the problem was asking for the number of pairs of polynomials. But there is actually only 1 choice for f because no matter what variable we choose f to equal, both polynomial combinations result in the same function. So the correct answer was 3 + 5 $\cdot 1 = 8$ functions.

Desmos graph showing how these functions are exactly the same: https://www.desmos.com/calculator/w6sk67ly1i

*~grogg007*
## Solution 1 (Got Wrong)
None of the answer choices on the official test (which asked for the number of possible functions f(x)) were correct, but choice E would be correct if this problem asked for the number of pairs of functions (P(x), Q(x)).

Let R(x) = $\frac{P(x)}{Q(x)}.$  Since R(x) $\leq 0$ on [a, b] but not for values slightly less than a or slightly more than b, $P(x) = 0$ at x = a and x = b.  Therefore, $P(x) = (x-a)(x-b)(x-r)$ for some r $\in\{1, 2, 3, 4, 5\}$.

Since R(x) $\leq 0$ on (c, d) but not at x = c or x = d, R(x) is not continuous at x = c or x = d.  Therefore, R(x) must be undefined at x = c and x = d, that is, $Q(x) = 0$ at x = c and x = d.  So $Q(x) = (x-c)(x-d)(x-s)$ for some s $\in\{1, 2, 3, 4, 5\}$.

Therefore, R(x) = $\frac{(x-a)(x-b)(x-r)}{(x-c)(x-d)(x-s)}.$  Notice that $\frac{(x-a)(x-b)}{(x-c)(x-d)} \leq 0$ only on [a, b] and (c, d).  Therefore, $\frac{x-r}{x-s}$ must be nonnegative for all x $\notin\{a, b, c, d, r, s\}$.  This only happens if r = s.

Thus R(x) = $\frac{(x-a)(x-b)(x-r)}{(x-c)(x-d)(x-r)},$ which is the same as $\frac{(x-a)(x-b)}{(x-c)(x-d)}$ except that it is undefined at x = r.  Thus R(x) satisfies the desired property as long as r $\notin$ [a, b] $\cup (c, d).$

Note that each quintuple (a, b, c, d, r) defines a unique pair of functions (P(x), Q(x)).

If (a, b, c, d) = (1, 2, 3, 4), r can be 3, 4, or 5.

If (a, b, c, d) = (1, 2, 3, 5), r can be 3 or 5.

If (a, b, c, d) = (1, 2, 4, 5), r can be 3, 4, or 5.

If (a, b, c, d) = (1, 3, 4, 5), r can be 4 or 5.

If (a, b, c, d) = (2, 3, 4, 5), r can be 1, 4, or 5.

Therefore, there are $\boxed{(\textbf{E})\ 13}$ possible pairs of functions (P(x), Q(x)).

*~j314andrews*
## Solution 2 (credit to Sohil Rathi's video solution, pi_is_3.14 / OmegaLearn)
This is the solution to the original problem, which asked for the number of possible **functions**, not pairs of polynomials.

First, consider the problem if it were talking about two second degree polynomials. We can see that the function f(x) = $\frac{(x-a)(x-b)}{(x-c)(x-d)}$ by itself satisfies the condition of dropping below the x axis over [a,b] $\cup (c,d).$ Now, we need to add one extra (x-n) term each to the numerator and denominator.

Case 1:
f(x) = $\frac{(x-a)(x-b)(x-f)}{(x-c)(x-d)(x-f)}$ for some other value f not equal to a, b, c, or d.

Note that f cannot be between a and b or between c and d because this would create a hole in the interval. So the only possibilities are:


$$
*a = 1, b = 2, c = 3, d = 4, f = 5
*a = 1, b = 2, c = 4, d = 5, f = 3
*a = 2, b = 3, c = 4, d = 5, f = 1
$$


This gives us 3 valid functions so far.

Case 2:
f(x) = $\frac{(x-a)(x-b)(x-f)}{(x-c)(x-d)(x-f)}$ where f is c or d.

If f equals c or d the resulting function is essentially equivalent to f(x) = $\frac{(x-a)(x-b)}{(x-c)(x-d)}$ because a hole would already exist, so we can safely cancel the (x-f) terms. It doesn't matter whether we choose f to equal c or d because the function will still be the same. There are $\binom{5}{4} = 5$ ways to select the values for a, b, c, and d and 1 way to choose any variable for f to equal, giving 5 $\cdot 1 = 5$ valid functions for this case.

The correct answer is 5 + 3 = $\boxed{\textbf{(F) } 8}$ functions.

i tried my best to show what I think was Sohil's thought process, but please feel free to edit this if you can explain it better :)
## Solution 3
**Solution 1** by user j314andrews is incomplete; **Solution 2** by user grogg007 commits a serious logical error because it only provides functions that satisfy the requirements, without showing that no other functions do. Other places like [https://wiki.randommath.com/amc12/2025/part-a/problem-25] gives a good solution, but unfortunately it requires calculus. Here I am trying to provide a good solution that does not require calculus.

Let D and E be the set of the real roots of P(x) and Q(x), respectively. Then, outside of the intervals [a,b] and (c,d), f(x)>0 except when x $\in E,$ where f(x) is undefined.

For any function g(x), define a real number t as a **toggling point** for g(x) if there exists a sequence $t_1<t_2 < ... < t_N$, with the understanding that $t_0=-\infty$ and $t_{N+1}=\infty,$ such that
- $t =t_k$ for some 1 $\leq$ k $\leq N,$
- g(x) is of the same sign (either always positive or always negative) on each interval ($t_j$, $t_{j+1}$), for $j=0$, ..., N, and
- g(x) has opposite signs on ($t_{k-1}$, $t_k$) and ($t_k$, $t_{k+1}$).

We call these open intervals ($t_j$, $t_{j+1}) (j=0$, ..., N) the **bands** of g(x).

The polynomial P(x) has no toggling point outside of D, and Q(x) has no toggling point outside of E. Now in our problem, f(x) has exactly 4 toggling points: a, b, c, d. Our task is to see how these four points are related to the sets D and E.

**Lemma**. At each toggling point t for f(x),
1. either $P(t)=0$ or $Q(t)=0$ (or both);
1. if the multiplicities of the root t of P(x) and Q(x) are m and n, respectively, then m-n is odd.

**Proof**. (1) if both P(t) and Q(t) are nonzero, then t belongs to a band of P(x) and a band of Q(x). Taking the intersection between these two bands, we get an open interval on which f(x) has the same sign as f(t). Thus t cannot be a toggling point of f(x).

(2) If m is odd, there are real numbers r, s, with r, such that P(x) has the same sign on (r,t) and has the opposite sign on (t, s). If m is even, there are real numbers r, s, with r, such that P(x) has the same sign on (r,t) and on (t,s). Similar statements can be made of Q(x), having intervals (u, t) and (t, v) so that Q(t) is of the same sign on (u,t), and of either a different or the same sign on (t, v), depending on the parity of n. If both m and n are odd or both m and n are even, then P(t)/Q(t) is of the same sign on the interval ($\max\{r, u\}$, t) and (t, $\min\{s, v\}$), so t cannot be a toggling point for f(x). **Solution to the problem**. Since a is a toggling point for f(x), either $P(a)=0$ or $Q(a)=0$, or both. But since f(a) is defined, we have Q(a)$\neq 0,$ so $P(a)=0.$ The same can be said of b, so $P(b)=0.$ The multiplicities of a and b must be 1. Otherwise, point (2) of the Lemma would require the multiplicity of one of them to be at least 3, but P(x) is only cubic. c is a toggling point for f(x), so either $P(c)=0$ or $Q(c)=0$, or both. But if Q(c)$\neq 0,$ we have $f(c)=0$, violating the condition. So $Q(c)=0.$ Similarly, $Q(d)=0.$ Concerning their multiplicities, point (2) of the Lemma gives us three cases, given that Q(x) is only cubic: * (a) c is a single root of Q(x), P(c)$\neq 0,$ d is a double root of Q(x) and a single root of P(x); * (b) switching the roles of c and d; * (c) both c and d are single roots of Q(x), and Q(x) has a single root e other than c and d. Case (a) provides functions in the form of $\frac{(x-a)(x-b)(x-d)}{(x-c)(x-d)^2}.$ There are 5 of them because there are 5 ways to choose a, b, c, d from the set $\{1, 2, 3, 4, 5\}$. Case (b) provides functions in the form of $\frac{(x-a)(x-b)(x-c)}{(x-c)^2(x-d)},$ but they are the same as those provided in case (a). To ensure this, notice that the two expressions have the same domain and they are equal for every x in their domains. Case (c) requires that $P(e)=0$, because if P(e)$\neq 0$ then e becomes an extra toggling point for f(x). So this case provides functions in the form of $\frac{(x-a)(x-b)(x-e)}{(x-c)(x-d)(x-e)}.$ But since f(e) is undefined, we need to make sure that e does not fall into [a,b] or (c,d). So e can be 1, 3, 5. In all these cases, we also have f(e) = $\frac{(e-a)(e-b)}{(e-c)(e-d)} > 0,$ satisfying the conditions. That's 3 more functions. So the total number of functions is 5 + $3 =\boxed{8}.$ Lightest (talk) 22:51, 10 November 2025 (EST)
## Solution 4 (Multiplicity Analysis)
For the condition f(x)$\le 0 \iffx\in$ [a,b]$\cup(c,d),$ f must change sign at a, b, c, and d. The key trick is that a rational function can only change sign through zeroes or discontinuities. Since both P(x) and Q(x) are monic cubic polynomials, f(x) $\to 1$ as x $\to \pm\infty.$ This means f(x) is + for large |x|. The required sign pattern must therefore be: f(x): $\quad +$\underset{ a }{ [ }-\underset{ b }{ ] }+\underset{ c }{ ( }-\underset{ d }{ ) }+
- For the interval to be closed, [a, b], we must have $f(a) = 0$ and $f(b) = 0.$ This implies P(a) = $P(b) = 0$ and, critically, Q(a) $\neq 0$ and Q(b) $\neq 0$ to avoid discontinuity.
- For the interval to be open, (c, d), the function must be undefined at the endpoints: if f(c) were defined, by the intermediate value theorem $f(c)=0$, violating the condition. This implies $Q(c) = 0$ and $Q(d) = 0.$ Note that P(c),P(d) could be 0, as $\frac{0}{0}$ remains undefined.

 From this, we conclude that a, b, c, $d\in\{ 1,2,3,4,5 \}$. Let the remaining root in be t, so $\{ 1,2,3,4,5 \}=\{ a,b,c,d,t \}$. Let $p_i$, $q_i\in \mathbb{Z}_{\ge 0}$ be the multiplicities of a root $i=1$,2,3,4,5 in P(x),Q(x), respectively, e.g. $P(x)=(x-1)^{p_{1}}(x-2)^{p_{2}}(x-3)^{p_{3}}(x-4)^{p_{4}}(x-5)^{p_{5}}$. Let the multiplicity in f(x) at i be $m_i=p_i-q_i$. A sign change occurs at i if and only if $m_i$ is odd.
- The sign changes at a, b, c, d. Thus, $m_a$, $m_b$, $m_c$, $m_d$ must all be odd.
- The sign does not change at t. Thus, $m_t$ must be even.

 From the root analysis, $q_a = 0\impliesm_a=p_{a}-q_{a}=p_a$ is odd. Similarly, $p_b$ is odd. Since $\deg(P) = \sump_i = 3$, and $p_a$, $p_b\ge 1$ are odd, $m_{a}=m_{b}=p_{a}=p_{b}=1$. This forces the roots of P(x) to be distinct: $\{a, b, k\}$ for some k $\in\{ 1,2,3,4,5 \}\setminus\{a, b\}$ with $p_{k}=1$. We already distributed 2 roots for P and Q each, so there is 1 left to give. Our constraints give $p_{c}+p_{d}+p_{t}=1, p_{c}$,$p_{d}$,$p_{t}\in\{ 0,1 \}$ and $q_{t}\in\{0,1\}$, $q_{c}$, $q_{d}\in\{ 1,2 \}$. We can make some inferences:
- $p_{c}\in\{ 0,1 \}$, $q_c\in\{ 1,2 \}$, $m_c=p_{c}-q_{c}\in\{ -2,-1,0 \}$. Since $m_c$ is odd, $m_{c}$ = -1. Similarly, $m_{d}$=-1.
- $p_{t}\in\{ 0,1 \}$, $q_{t}\in\{ 0,1 \}$, $m_{t}=p_{t}-q_{t}\in\{ -1,0,1 \}$. Since $m_{t}$ is even, $m_{t}=0$.

 At this point, we have ($m_{a}$,$m_{b}$,$m_{c}$,$m_{d}$,$m_{t}$)=(1,1,-1,-1,0). But this is exactly the distribution of multiplicities of $\frac{(x-a)(x-b)}{(x-c)(x-d)},$ which is forced from the beginning. Thus, the remaining multiplicity of each of P and Q must cancel into a single bin to create net multiplicity 0=1-1, yielding f(x)=$\frac{(x-a)(x-b)}{(x-c)(x-d)}\cdot \frac{x-k}{x-k}$ where k=c,d,t, and this creates a hole if there isn't one already. However, the problem is that if there is already a hole (i.e. k=c,d), then this factor $\frac{x-k}{x-k}$ changes nothing as f was already undefined at x=k, so while it gives a different pair of polynomials, it does not provide a new function f. Cases k=c,d are symmetric: WLOG, let k=c, and choosing $t=1$,2,3,4,5 determines the remaining $1\le$ a. Each t creates a unique pair of polynomials, so there are $2\cdot \binom{5}{1}=10$ pairs of polynomials. However, as established, puncturing a hole again on k=c,d does nothing: f(x)=$\frac{(x-a)(x-b)}{(x-c)(x-d)}\cdot \frac{x-c}{x-c}=\frac{(x-a)(x-b)}{(x-c)(x-d)}\cdot \frac{x-d}{x-d}$ So each t creates exactly one new function regardless of whether k=c or k=d, i.e. there are only 5 new functions. Case k=t: Sketching a quick diagram for ($\text{sign pattern of }$f), t cannot puncture [a,b] nor (c,d), meaning it must lie outside them. All other cases cases do work, since you can puncture + intervals without affecting - intervals.  $\begin{cases}$ t,[a,b],(c,d) \\ [a,b],t,(c,d) \\ [a,b],(c,d),t $\end{cases}$  Hence, there are 3 valid choices of t. In total, there are $10+3=\boxed{ \textbf{(E)}~13 }$ ordered pairs of polynomials (P,Q) but only $\boxed{ 8 }$ different functions created by $f=\frac{P}{Q}.$ ~imosilver
## Video Solution 1 by OmegaLearn.org
https://youtu.be/SPbTyq3Dz_0
## See Also
