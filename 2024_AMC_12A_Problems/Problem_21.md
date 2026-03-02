# 2024 AMC 12A Problem 21

## Problem
Suppose that $a_1 = 2$ and the sequence $(a_n)$ satisfies the recurrence relation $\frac{a_n -1}{n-1}=\frac{a_{n-1}+1}{(n-1)+1}$for all n $\ge 2.$ What is the greatest integer less than or equal to $\sum^{100}_{n=1}a_n^2$?

$\textbf{(A) } 338{,}550 \qquad \textbf{(B) } 338{,}551 \qquad \textbf{(C) } 338{,}552 \qquad \textbf{(D) } 338{,}553 \qquad \textbf{(E) } 338{,}554$
## Solution 1
Multiply both sides of the recurrence to find that n$(a_n-1)=(n-1)(a_{n-1}+1)=(n-1)(a_{n-1}-1)+(n-1)(2)$.

Let $b_n=n(a_n-1$). Then the previous relation becomes
$$b_n=b_{n-1}+2(n-1)$$

We can rewrite this relation for values of n until 1 and use telescoping to derive an explicit formula:


$$
b_n=b_{n-1}+2(n-1)
b_{n-1}=b_{n-2}+2(n-2)
b_{n-2}=b_{n-3}+2(n-3)
\cdot
\cdot
\cdot
b_2=b_1+2(1)
$$


Summing the equations yields:


$$
b_n+b_{n-1}+\cdots+b_2=b_{n-1}+b_{n-2}+\cdots+b_1+2((n-1)+(n-2)+\cdots+1)
b_n-b_1=2\cdot\frac{n(n-1)}{2}
b_n-1=n(n-1)
b_n=n(n-1)+1
$$


Now we can substitute $a_n$ back into our equation:


$$
n(a_n-1)=n(n-1)+1
a_n-1=n-1+\frac{1}{n}
a_n=n+\frac{1}{n}
a_n^2=n^2+\frac{1}{n^2}+2
$$


Thus the sum becomes


$$\sum^{100}_{n=1} a_n^2= \sum^{100}_{n=1} n^2+ \sum^{100}_{n=1} \frac{1}{n^2}+ \sum^{100}_{n=1} 2$$


We know that $\sum^{100}_{n=1}n^2=\frac{100\cdot101\cdot201}{6}=338350,$ and we also know that $\sum^{100}_{n=1} 2=200,$ so the requested sum is equivalent to $\sum^{100}_{n=1} \frac{1}{n^2}+338550.$ All that remains is to calculate $\sum^{100}_{n=1} \frac{1}{n^2},$ and we know that this value lies between 1 and 2 (see the note below for a proof). Thus,


$$
\sum^{100}_{n=1} a_n^2= \sum^{100}_{n=1} \frac{1}{n^2}+338550<2+338550=338552
\sum^{100}_{n=1} a_n^2= \sum^{100}_{n=1} \frac{1}{n^2}+338550>1+338550=338551
$$


so

$$\sum^{100}_{n=1} a_n^2\in(338551,338552)$$

and thus the answer is $\boxed{\textbf{(B) }338551}.$

*~eevee9406*

**Note:** $\sum^{100}_{n=1} \frac{1}{n^2}< \sum^{\infty}_{n=1} \frac{1}{n^2}=\frac{\pi^2}{6}<2.$ It is obvious that the sum is greater than 1 (since it contains $\frac{1}{1^2}$ as one of its terms).

If you forget this and have to derive this on the exam, here is how:


$$\sum^{100}_{n=1} \frac{1}{n^2}<\sum^{\infty}_{n=1} \frac{1}{n^2}=\frac{1}{1^1}+\left(\frac{1}{2^2}+\frac{1}{3^2}\right)+\left(\frac{1}{4^2}+\frac{1}{5^2}+\frac{1}{6^2}+\frac{1}{7^2}\right)+\cdots$$


$$<1+\left(\frac{1}{2^2}+\frac{1}{2^2}\right)+\left(\frac{1}{4^2}+\frac{1}{4^2}+\frac{1}{4^2}+\frac{1}{4^2}\right)+\left(\frac{1}{8^2}+\frac{1}{8^2}+\frac{1}{8^2}+\frac{1}{8^2}+\frac{1}{8^2}+\frac{1}{8^2}+\frac{1}{8^2}+\frac{1}{8^2}\right)+\cdots$$


$$=1+\frac{2}{2^2}+\frac{4}{4^2}+\frac{8}{8^2}+\cdots$$

$$=1+\frac{1}{2}+\frac{1}{4}+\frac{1}{8}+\cdots=2$$

and it is clear that $\sum^{100}_{n=1} \frac{1}{n^2}<2.$ ~eevee9406
## Solution 2
According to the equation given,

$$\frac{a_n - 1}{n - 1} = \frac{a_{n - 1} + 1}{n}$$

$$na_n - n = (n - 1)a_{n - 1} + n - 1$$

$$na_n - (n - 1)a_{n - 1} = 2n - 1$$

Suppose $\{b_n\}$, $b_n$ = na_n, then $b_n-b_{n - 1}=2n - 1$, where $b_1 = 1\cdota_1 = 2$, then we obtain that

$$b_n = b_1 + (b_2 - b_1) + (b_3 - b_2) + \cdots + (b_n - b_{n - 1})$$

$$b_n = 2 + 3 + 5 + \cdots + (2n - 1) = 1 + n^2$$

$$a_n = \frac{1 + n^2}{n} = n + \frac{1}{n}$$

Hence,


$$
\begin{align*} \sum_{n = 1}^{100} a_n^2 &= \sum_{n = 1}^{100} \left(n + \frac{1}{n}\right)^2\\ &= \sum_{n = 1}^{100} (n^2 + 2 + \frac{1}{n^2})\\ &= \sum_{n = 1}^{100} n^2 + \sum_{n = 1}^{100} 2 + \sum_{n = 1}^{100}\frac{1}{n^2}\\ &= \frac{1}{6} \cdot 100 \cdot (100 + 1) \cdot (100 \cdot 2 + 1) + 100 \cdot 2 + \sum_{n = 1}^{100}\frac{1}{n^2}\\ &= 338350 + 200 + \sum_{n = 1}^{100}\frac{1}{n^2}\\ &= 338550 + \sum_{n = 1}^{100}\frac{1}{n^2} \end{align*}
$$


Notice that,
$$\sum_{n = 1}^{100}\frac{1}{n^2} = 1 + \sum_{n = 2}^{100}\frac{1}{n^2} > 1$$
$\sum_{n = 1}^{100}\frac{1}{n^2} < 1 + \sum_{n = 2}^{100}\frac{1}{n(n - 1)} = 1 + 1 - \frac{1}{100} < $2~~($\text{telescope})$

so

$$\sum^{100}_{n=1} a_n^2\in(338551,338552)$$

and thus the answer is $\boxed{\textbf{(B) }338551}.$

~[https://artofproblemsolving.com/wiki/index.php/User:Reda_mandymath reda_mandymath]
## Solution 3 (lazy + quick)
We'll first try to isolate $a_n$ in terms of $a_{n-1}$.

$$(a_n-1)(n-1+1)=(n-1)(a_{n-1}+1)$$

$$a_n-1=\frac{(n-1)(a_{n-1}+1)}{n}$$

$$a_n=\frac{n-1}{n}(a_{n-1}+1)+1$$

$$a_n=\frac{n-1}{n}(a_{n-1})+\frac{n-1}{n}+1$$

$$a_n=\frac{n-1}{n}(a_{n-1})+\frac{2n-1}{n}$$

Now, as with many, many of these large summation problems, if we just evaluate the first few values in the series, a pattern should emerge quickly. Here it works out well since our product on the LHS cancels out.

$$a_1=2$$

$$a_2=\frac{1}{2}(2)+\frac{3}{2}=\frac{5}{2}$$

$$a_3=\frac{2}{3}(\frac{5}{2})+\frac{5}{3}=\frac{10}{3}$$

$$a_4=\frac{3}{4}(\frac{10}{3})+\frac{7}{4}=\frac{17}{4}$$

Here it becomes glaringly obvious that $a_n=\frac{n^2+1}{n}=n+\frac{1}{n}.$

$$So, a_n^2=n^2+\frac{1}{n^2}+2.$$

We proceed with the same summation strategy as Solution 1 and get our answer of $\boxed{\textbf{(B) }338551}.$

*Note: You only have find the answer's units digit from the answer choices; that's 0+1+0 for each sum, giving choice B.

*~nm1728*
## Solution 4 (transform)

$$
n a_{n} - n = (n-1) a_{n-1} + n-1
n \cdot a_{n} - n^2 = (n-1) a_{n-1} - n^2 +2n-1
n \cdot a_{n} - n^2 = (n-1) a_{n-1} - (n-1)^2
$$

Set  $b_{n}$ = n $a_{n}- n^2$

$$
n a_{n} - n^2 = b_{n} = b_{n-1}= ... = b_{1} =1
a_{n} = \frac{1}{n} + n
a_{n}^2 = \frac{1}{n^2} + n^2 +2
$$


 Sum $= 1^2 + 2^2$ + ... + 100^2 + 2* 100 + 1^2 + 1 / 2^2 + ... + 1/ 100^2 = 100 * 101 *201 / 6 + 200 + 1 + ... = 338551.xxx $\boxed{\textbf{(B) }338551}$

~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Solution 5 (transform)
According to the equation given,

$$\frac{a_n - 1}{n - 1} = \frac{a_{n - 1} + 1}{n}$$


$$na_n = (n - 1)a_{n - 1} + 2n - 1 = (n - 2)a_{n - 2} + (2n-3) + (2n - 1) = 1*a_{1} + 1 + 3 + ... + 2n - 1 = 1 + \frac{1+ (2n-1)*n}{2} = n^2+ 1$$


$$a_n =n + \frac{1}{n}$$

The rest continues similar to Solution 1 or 2

~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## See also
